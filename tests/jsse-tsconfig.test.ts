import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const TSCONFIG_FILES = [
  "tsconfig.json",
  "tsconfig.cjs.json",
  "tsconfig.strict.json",
  "tsconfig.strict-cjs.json",
];

describe("tsconfig files", () => {
  for (const file of TSCONFIG_FILES) {
    describe(file, () => {
      const raw = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;

      it("has $schema", () => {
        assert.ok("$schema" in parsed, `missing $schema in ${file}`);
      });

      it("$schema is first key", () => {
        const firstKey = Object.keys(parsed)[0];
        assert.equal(firstKey, "$schema", `$schema is not the first key in ${file} (got "${firstKey}")`);
      });
    });
  }
});
