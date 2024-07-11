# Useful Scripts

This repository contains scripts that assist in maintaining the project.

## refactor_import_statement.js

### Overview

At the beginning of the project, we prefixed all import paths in the core package with `@symmio/frontend-sdk/`. As the project evolved, this strategy posed challenges:

- We had to add multiple paths to `tsconfig.json`.
- Monorepo setups became more complex.
- New contributors found the setup confusing.

To address these issues, we created this script to transform our prefixed paths to relative paths.

### How to use:

Place the script in the desired directory. For our project, the target directory is `packages/core/src`.
Navigate to the directory and run the script:

```
node refactor_import_statement.js
```
