import fs from "node:fs";
import process from "node:process";

import * as prettier from "prettier";

const TSCONFIG_SCHEMA_URL = "https://www.schemastore.org/tsconfig";

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

function removeKeys(obj: JsonObject, keysToRemove: string[]): void {
  for (const key of keysToRemove) {
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
    delete obj[key];
  }
  for (const [key, value] of Object.entries(ordered)) {
    obj[key] = value;
  }
}

function cleanSchema(schema: JsonValue): JsonValue {
  const keysToRemove = ["x-intellij-html-description", "markdownDescription"];
  visitObjects(schema, (obj) => {
    // remove stupid keys
    removeKeys(obj, keysToRemove);

    // reorder so `type` comes first, then `default`
    const keysOrdering = ["type", "enum", "default"];
    reorderKeysInplace(obj, keysOrdering);
  });
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

async function main() {
  const schema = await fetchSchema(TSCONFIG_SCHEMA_URL);
  const outputPath = "./tsconfig.schema.json";
  const cleanedSchema = cleanSchema(schema);
  const newContent = JSON.stringify(cleanedSchema, undefined, 2);
  const formattedContent = await formatJson(newContent);

  try {
    const existing = fs.readFileSync(outputPath, "utf8");
    if (existing === formattedContent) {
      console.log(`tsconfig schema is already up to date at ${outputPath}`);
      return;
    }
  } catch {
    // file doesn't exist yet, proceed with write
  }

  fs.writeFileSync(outputPath, formattedContent, "utf8");
  console.log(`Updated tsconfig schema at ${outputPath}`);
}

try {
  await main();
} catch (error) {
  console.error("Error updating tsconfig schema:", error);
  process.exit(1);
}
