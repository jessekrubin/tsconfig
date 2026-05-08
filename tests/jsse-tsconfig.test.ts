import { readFileSync } from "node:fs";
import { suite, test } from "node:test";
import assert from "node:assert/strict";

const TSCONFIG_FILES = [
  "tsconfig.json",
  "tsconfig.cjs.json",
  "tsconfig.strict.json",
  "tsconfig.strict-cjs.json",
];

const TSCONFIG_SCHEMA_URL = "https://www.schemastore.org/tsconfig";
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
    });
  }
});
