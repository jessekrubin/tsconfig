/* eslint-disable @typescript-eslint/no-explicit-any */

import fs, { promises as fsp } from "node:fs";
import path from "node:path";
import process from "node:process";

const _ISWIN = process.platform === "win32";
const _DEBUG =
  // eslint-disable-next-line dot-notation
  process.env["DEBUG"] ||
  process.argv.map((arg) => arg.toLowerCase()).includes("--debug");
const __FILENAME = _ISWIN
  ? import.meta.url.replace("file://", "").replace(/^\/(\w):/, "$1:")
  : import.meta.url.replace("file://", "");
const __DIRNAME = path.dirname(__FILENAME);
const REPO_ROOT = path.dirname(__DIRNAME);
const PKG_JSON_FILEPATH = path.resolve(__DIRNAME, "../package.json");

type PackageJson = {
  name: string;
  version: string;
  description: string;
  main: string;
  types: string;
  exports: Record<
    string,
    | string
    | {
        types: string;
        require: string;
        import: string;
      }
  >;
  files: string[];
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  [key: string]: any;
};

function echo(...args: any[]) {
  console.log(...args);
}

function debug(...args: any[]) {
  if (_DEBUG) {
    console.log("_______\n[DEBUG]", ...args);
  }
}

async function findTsconfigFiles() {
  const files = await fsp.readdir(".");
  return files.filter(
    (file) =>
      file.endsWith(".json") &&
      file.startsWith("tsconfig") &&
      ["build", "tsconfig._"].every((exclude) => !file.includes(exclude)),
  );
}

async function main() {
  debug({
    _ISWIN,
    _DEBUG,
    __FILENAME,
    __DIRNAME,
    REPO_ROOT,
    PKG_JSON_FILEPATH,
  });
  const tsconfigFiles = await findTsconfigFiles();
  const tsconfigs = tsconfigFiles.map((tsconfigFile) => {
    return JSON.parse(fs.readFileSync(tsconfigFile, "utf8"));
  });
  echo(tsconfigs);
  echo(`Found ${tsconfigFiles.length} tsconfig files:`, tsconfigFiles);
  // read package.json
  const pkgJsonStr = await fsp.readFile("./package.json", "utf8");
  const pkg = JSON.parse(pkgJsonStr) as PackageJson;
  const pkgOg = JSON.parse(pkgJsonStr) as PackageJson;

  /**
   * ====================
   * PACKAGE.JSON.EXPORTS
   * ====================
   */
  for (const tsconfigFile of tsconfigFiles) {
    // const tsconfig = JSON.parse(await fs.readFile(tsconfigFile, 'utf-8'));
    console.log(tsconfigFile);
    pkg.exports[`./${tsconfigFile}`] = `./${tsconfigFile}`;
    if (tsconfigFile !== "tsconfig.json") {
      const tsconfigName = tsconfigFile
        .replace(".json", "")
        .replace("tsconfig.", "");
      pkg.exports[`./${tsconfigName}`] = `./${tsconfigFile}`;
      pkg.exports[`./${tsconfigName}.json`] = `./${tsconfigFile}`;
    }
  }

  for (const [key, value] of Object.entries(pkg.exports)) {
    if (!key.includes("tsconfig")) {
      continue;
    }
    // check that the tsconfig file exists
    const tsconfigFile = key;
    const tsconfigFilename = path.basename(tsconfigFile);
    const tsconfigFilepath = path.resolve(REPO_ROOT, tsconfigFile);
    debug(
      `[${tsconfigFilename}] ${tsconfigFile} => ${JSON.stringify(
        value,
        undefined,
        2,
      )}:`,
      {
        tsconfigFile,
        tsconfigFilename,
        tsconfigFilepath,
        value,
      },
    );

    // if not in the tsconfigFiles, remove it from the exports
    if (!tsconfigFiles.includes(tsconfigFilename)) {
      echo(
        `EXPORT NOT FOUND ${tsconfigFile}: Removing ${tsconfigFile} from package.json exports.`,
      );
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete pkg.exports[key];
    }
  }
  /**
   * ==================
   * PACKAGE.JSON.FILES
   * ==================
   */

  // if not already in files, add it...
  if (!pkg.files) {
    pkg.files = [];
  }
  for (const tsconfigFile of tsconfigFiles) {
    if (!pkg.files.includes(tsconfigFile)) {
      pkg.files.push(tsconfigFile);
    }
  }
  for (const file of pkg.files) {
    if (!file.includes("tsconfig")) {
      continue;
    }
    // check that the tsconfig file is in tsconfigFiles
    const tsconfigFile = file;
    const tsconfigFilename = path.basename(tsconfigFile);
    if (!tsconfigFiles.includes(tsconfigFilename)) {
      echo(
        `FILE NOT FOUND ${tsconfigFile}: Removing ${tsconfigFile} from package.json files.`,
      );
      pkg.files = pkg.files.filter((f) => f !== tsconfigFile);
    }
  }

  // make sure that files is unique and sorted
  pkg.files = [...new Set(pkg.files)].sort();
  // files field in package.json
  if (JSON.stringify(pkg) === JSON.stringify(pkgOg)) {
    echo("No changes to package.json");
  } else {
    echo("Changes to package.json");
    // write package.json
    await fsp.writeFile("./package.json", JSON.stringify(pkg, undefined, 2));
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
