/**
 * Possible CLI? TBD!
 */
import process from "node:process";
import { version } from "../package.json";

async function main(args?: string[]) {
  const argv = args || process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log("Usage: jsse-tsconfig TBD");
    return;
  }
  if (argv.includes("--version") || argv.includes("-v")) {
    console.log(`jsse-tsconfig: v${version}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
