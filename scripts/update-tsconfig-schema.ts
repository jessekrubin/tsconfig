import fs from "node:fs";
import process from "node:process";

import * as prettier from "prettier";

// eslint-disable-next-line unicorn/no-declarations-before-early-exit
const TSCONFIG_SCHEMA_URL = "https://www.schemastore.org/tsconfig#";

type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[];
type JsonObject = { [Key in string]: JsonValue };
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

async function formatJson(jsonstr: string): Promise<string> {
  return prettier.format(jsonstr, { parser: "json", objectWrap: "collapse" });
}

function visitObjects(
  obj: JsonValue,
  callback: (obj: JsonObject) => void,
): void {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      visitObjects(item, callback);
    }
  } else if (obj !== null && typeof obj === "object") {
    callback(obj);
    for (const value of Object.values(obj)) {
      visitObjects(value, callback);
    }
  }
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function removeKeys(obj: JsonObject, keysToRemove: string[]): void {
  for (const key of keysToRemove) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete obj[key];
  }
}

function reorderKeys(
  object: JsonObject,
  keyOrder: readonly string[],
): JsonObject {
  const kranks = new Map(keyOrder.map((key, index) => [key, index]));
  return Object.fromEntries(
    Object.entries(object).toSorted(
      ([keyA], [keyB]) =>
        (kranks.get(keyA) ?? Infinity) - (kranks.get(keyB) ?? Infinity),
    ),
  );
}

function reorderKeysInplace(obj: JsonObject, keysOrdering: string[]): void {
  const ordered = reorderKeys(obj, keysOrdering);
  for (const key of Object.keys(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete obj[key];
  }
  for (const [key, value] of Object.entries(ordered)) {
    obj[key] = value;
  }
}
const SCHEMA_KEYS_ORDERING = [
  "$schema",
  "$comment",
  "id",
  "$id",
  "$ref",
  "title",
  "type",
  "const",
  "enum",
  "anyOf",
  "oneOf",
  "items",
  "properties",
  "additionalProperties",
  "required",
  "uniqueItems",
  "allOf",
  "default",
  "definitions",
  "description",
];

if (SCHEMA_KEYS_ORDERING.length !== new Set(SCHEMA_KEYS_ORDERING).size) {
  throw new Error("SCHEMA_KEYS_ORDERING contains duplicate keys");
}

function cleanSchema(schema: JsonValue): JsonValue {
  const keysToRemove = ["x-intellij-html-description", "markdownDescription"];
  visitObjects(schema, (obj) => {
    // remove stupid keys
    removeKeys(obj, keysToRemove);

    // cheapest signal first, prose last - so a property is scannable at a glance
    reorderKeysInplace(obj, SCHEMA_KEYS_ORDERING);
  });
  if (typeof schema === "object" && schema !== null && !Array.isArray(schema)) {
    reorderKeysInplace(schema, SCHEMA_KEYS_ORDERING);
  }
  return schema;
}

async function fetchSchema(url: string): Promise<JsonValue> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch schema: ${response.status} ${response.statusText}`,
    );
  }
  const schema = await response.json();
  if (typeof schema !== "object" || schema === null) {
    throw new Error(
      `Invalid schema format: expected an object, got ${typeof schema}`,
    );
  }
  return schema as JsonValue;
}

/**
 * The upstream tsconfig schema pairs a bunch of enums with a redundant,
 * case-insensitive `pattern` regex sibling inside an `anyOf` - the pattern says
 * nothing the enum doesn't already say, and it turns into unreadable regex
 * noise once this schema gets baked into TypeScript source.
 *
 * this shows up in (at least):
 *
 * - `compilerOptions.module`
 * - `compilerOptions.moduleResolution`
 * - `compilerOptions.target`
 * - `compilerOptions.lib`
 * - `compilerOptions.newLine`
 *
 * This drops any `anyOf` branch that's just `{ pattern: "..." }`, and collapses
 * `anyOf` entirely when only one branch survives.
 */
function stripRedundantAnyOfPatterns(schema: JsonValue): JsonValue {
  visitObjects(schema, (obj) => {
    const anyOf = obj["anyOf"];
    if (!Array.isArray(anyOf)) {
      return;
    }

    const kept = anyOf.filter(
      (item) => !isJsonObject(item) || typeof item["pattern"] !== "string",
    );
    if (kept.length === anyOf.length) {
      return;
    }

    delete obj["anyOf"];
    const [only] = kept;
    if (only !== undefined && kept.length === 1 && isJsonObject(only)) {
      Object.assign(obj, only);
    } else {
      obj["anyOf"] = kept;
    }
  });
  return schema;
}

function isStringArray(value: JsonValue | undefined): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function getIn(
  value: JsonValue | undefined,
  path: string[],
): JsonValue | undefined {
  let current = value;
  for (const key of path) {
    if (!isJsonObject(current)) {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

/**
 * `compilerOptions.lib` entries are cased like `"ES2015"`/`"DOM"` upstream,
 * with no lowercase alternatives - `tsconfig-json.ts`'s `TsconfigLib` already
 * hand-encodes lowercase alternatives for exactly this reason. This makes the
 * generated schema agree, adding a lowercase variant of every `lib` value.
 *
 * (Other enum-like options - `module`, `target`, `watchFile`, etc - are left
 * as-is; `tsc` may accept other casings for those too, but `lib` is the one
 * `tsconfig-json.ts` already commits to.)
 */
function addLowercaseLibVariants(schema: JsonValue): JsonValue {
  const libItems = getIn(schema, [
    "definitions",
    "compilerOptionsDefinition",
    "properties",
    "compilerOptions",
    "properties",
    "lib",
    "items",
  ]);
  if (!isJsonObject(libItems)) {
    return schema;
  }

  const enumValues = libItems["enum"];
  if (!isStringArray(enumValues)) {
    return schema;
  }

  const seen = new Set(enumValues);
  const extraValues: string[] = [];
  for (const value of enumValues) {
    const lower = value.toLowerCase();
    if (seen.has(lower)) {
      continue;
    }

    seen.add(lower);
    extraValues.push(lower);
  }

  if (extraValues.length > 0) {
    libItems["enum"] = [...enumValues, ...extraValues];
  }
  return schema;
}

function writeIfChanged(path: string, content: string): void {
  let existing: string | undefined;
  try {
    existing = fs.readFileSync(path, "utf8");
  } catch {
    // file doesn't exist yet, proceed with write
  }

  if (existing === content) {
    console.log(`${path} is already up to date`);
    return;
  }
  fs.writeFileSync(path, content, "utf8");
  console.log(`Updated ${path}`);
}

async function main() {
  const schema = await fetchSchema(TSCONFIG_SCHEMA_URL);
  const cleanedSchema = cleanSchema(
    addLowercaseLibVariants(stripRedundantAnyOfPatterns(schema)),
  );

  const formattedJson = await formatJson(
    JSON.stringify(cleanedSchema, undefined, 2),
  );
  writeIfChanged("./tsconfig.schema.json", formattedJson);

  const tsSchemaContent = [
    "// **GENERATED** - do not edit by hand, run `tsx scripts/update-tsconfig-schema.ts`",
    `export const TSCONFIG_JSON_SCHEMA_LITE = ${JSON.stringify(cleanedSchema)} as const;`,
  ].join("\n");
  const formattedTsSchema = await prettier.format(tsSchemaContent, {
    parser: "typescript",
  });
  writeIfChanged("./src/json-schema.ts", formattedTsSchema);
}

try {
  await main();
} catch (error) {
  console.error("Error updating tsconfig schema:", error);
  process.exit(1);
}
