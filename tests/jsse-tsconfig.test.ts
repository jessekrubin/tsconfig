import assert from "node:assert/strict";
import { globSync, readFileSync } from "node:fs";
import { suite, test } from "node:test";

/// keep-sorted
const TSCONFIG_FILES = [
  "tsconfig.bundler.json",
  "tsconfig.json",
  "tsconfig.node.json",
  "tsconfig.strict.json",
];
const TSCONFIG_SCHEMA_URL = "https://www.schemastore.org/tsconfig.json";

test("tsconfig files list is correct", () => {
  const ignoredFiles = new Set([
    "tsconfig.schema.json",
    "tsconfig._eslint.json",
    "tsconfig._build.json",
  ]);
  const files = globSync("tsconfig*.json", {
    cwd: new URL("../", import.meta.url),
  }).filter((file) => !ignoredFiles.has(file));
  assert.deepEqual(
    files.toSorted((a, b) => a.localeCompare(b)),
    TSCONFIG_FILES.toSorted((a, b) => a.localeCompare(b)),
    "tsconfig files list is incorrect",
  );
});

suite("tsconfig files", () => {
  for (const file of TSCONFIG_FILES) {
    suite(file, () => {
      const raw = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;

      const schema_value = (parsed["$schema"] ?? "<UNDEFINED>") as string;

      test("has $schema", () => {
        assert.ok("$schema" in parsed, `missing $schema in ${file}`);
      });

      test("$schema is correct", () => {
        assert.equal(
          schema_value,
          TSCONFIG_SCHEMA_URL,
          `$schema URL is incorrect in ${file} (got "${schema_value}")`,
        );
      });

      test("$schema is first key", () => {
        const firstKey = Object.keys(parsed)[0];
        assert.equal(
          firstKey,
          "$schema",

          `$schema is not the first key in ${file} (got "${firstKey}")`,
        );
      });

      test("has $id", () => {
        assert.ok("$id" in parsed, `missing $id in ${file}`);
      });
    });
  }
});
