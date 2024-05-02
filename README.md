# `@jsse/tsconfig`

![npm version](https://img.shields.io/npm/v/%40jsse%2Ftsconfig)

tsconfig(s) `compilerOptions`

## Install

```bash
pnpm add @jsse/tsconfig
npm install @jsse/tsconfig
yarn add @jsse/tsconfig
```

## Usage

** Configs:**

```jsonc
{
  // ESM ("type": "module")
  "extends": "@jsse/tsconfig/tsconfig.json",
  // CJS ("type": "commonjs")
  "extends": "@jsse/tsconfig/tsconfig.cjs.json",
  "compilerOptions": {
    // yall's override(s)
    "target": "es2015",
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"],
}
```

---

# DEV

- pnpm = package-manager
- Repo uses `just` (ref)
  - just-repo: https://github.com/casey/just
  - just-docs: https://just.systems/man/en/
- prettier formatting; uses default config b/c configuring formatters is dumb
