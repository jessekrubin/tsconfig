import jsse from "@jsse/eslint-config";

export default jsse(
  {
    ignores: ["**/dev"],
    debug: false,
    typescript: {
      tsconfig: ["tsconfig.json", "tsconfig.eslint.json"],
    },
    reportUnusedDisableDirectives: true,
    off: [],
    prettier: true,
    // gitignore: {
    //   files: [".gitignore"],
    //   strict: true,
    //   root: true
    // }
  },
  /**
   * overrides
   */
  // ...[
  //   {
  //     files: ["*.ts", "*.tsx"],
  //     rules: {}
  //   }
  // ]
);
