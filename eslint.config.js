import jsse from "@jsse/eslint-config";

export default jsse(
  {
    ignores: ["**/dev"],
    debug: false,
    typescript: { strict: true, tsconfig: "tsconfig._eslint.json" },
    reportUnusedDisableDirectives: true,
    off: [],
    sortPackageJson: true,
    nodeTest: true,
  },
  /**
   * overrides
   */
  { files: ["scripts/**", "dev/**"], rules: { "no-console": "off" } },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            {
              from: "package",
              name: [
                "describe",
                "it",
                "test",
                "suite",
                "before",
                "after",
                "beforeEach",
                "afterEach",
              ],
              package: "node:test",
            },
          ],
        },
      ],
    },
  },
);
