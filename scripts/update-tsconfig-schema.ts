import fs from "node:fs";
import process from "node:process";

const TSCONFIG_SCHEMA_URL = "https://www.schemastore.org/tsconfig";

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

  try {
    const existing = fs.readFileSync(outputPath, "utf8");
    if (existing === newContent) {
      console.log(`tsconfig schema is already up to date at ${outputPath}`);
      return;
    }
  } catch {
    // file doesn't exist yet, proceed with write
  }

  fs.writeFileSync(outputPath, newContent, "utf8");
  console.log(`Updated tsconfig schema at ${outputPath}`);
}

main().catch((error) => {
  console.error("Error updating tsconfig schema:", error);
  process.exit(1);
});
