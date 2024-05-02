# `@jsse/tsconfig`

[![npm version](https://badge.fury.io/js/%jsse%tsconfig.svg)](https://badge.fury.io/js/%jsse%tsconfig)

tsconfig(s) `compilerOptions`

## Install

```bash
pnpm add @jsse/tsconfig
npm install @jsse/tsconfig
yarn add @jsse/tsconfig
```

## Example

```jsonc
{
  "extends": "@jsse/tsconfig",
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

- Repo uses `just` (ref)
  - just-repo: https://github.com/casey/just
  - just-docs: https://just.systems/man/en/
- pnpm is the package manager
- prettier formatting uses the default config b/c configuring formaters is dumb
