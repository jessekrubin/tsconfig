import fs from "node:fs";
import process from "node:process";

import * as prettier from "prettier";

const TSCONFIG_SCHEMA_URL = "https://www.schemastore.org/tsconfig";

async function formatJson(jsonstr: string): Promise<string> {
  return prettier.format(jsonstr, { parser: "json", objectWrap: "collapse" });
}

async function main() {
  const response = await fetch(TSCONFIG_SCHEMA_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch tsconfig schema: ${response.status} ${response.statusText}`,
    );
  }
  const schema = await response.json();
  const outputPath = "./tsconfig.schema.json";
  const newContent = JSON.stringify(schema, undefined, 2);
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
