import { describe, expect, test } from "vitest";
import * as lib from "./index.js";

describe("exports", () => {
  test("version", async () => {
    expect(lib).toBeDefined();
    expect(lib.__version__).toBeDefined();
  });
});
