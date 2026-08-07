import { defineConfig } from "tsdown";

const SHARED = {
  platform: "node",
  format: ["esm"],
  fixedExtension: false,
  publint: true,
  outDir: "dist",
  tsconfig: "./tsconfig._build.json",
} satisfies Parameters<typeof defineConfig>[0];

export default defineConfig({
  ...SHARED,
  entry: ["src/mod.ts"],
  minify: "dce-only",
  deps: {},
  dts: true,
  hash: false,
  clean: true,
});
