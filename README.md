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
  "extends": "@jsse/tsconfig/tsconfig.json",
  // OR
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

- Repo uses `just` (ref)
  - just-repo: https://github.com/casey/just
  - just-docs: https://just.systems/man/en/
- pnpm is the package manager
- prettier formatting uses the default config b/c configuring formaters is dumb
