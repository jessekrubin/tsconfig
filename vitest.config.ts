import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    exclude: [...defaultExclude, "_fixtures/**", "fixtures/**"],
  },
});
