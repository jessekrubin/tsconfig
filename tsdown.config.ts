import { defineConfig } from "tsdown";

export default defineConfig({
  platform: "node",
  format: ["esm"],
  fixedExtension: false,
  publint: true,
  sourcemap: false,
  outDir: "dist",
  tsconfig: "./tsconfig._build.json",
  // ------------
  entry: ["src/mod.ts"],
  minify: "dce-only",
  deps: {},
  dts: { sourcemap: false },
  hash: false,
  clean: true,
});
