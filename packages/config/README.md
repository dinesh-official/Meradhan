# Config package

This package centralizes environment loading and config helpers for the mono-repo.

Exports:

- `env` — typed environment variables
- `getRequiredSecret` — throw if env variable missing
- `getOptionalSecret` — optional secret helper

Example

```
import { env, getRequiredSecret, APP_NAME } from 'config';

console.log(env.NODE_ENV);
console.log(APP_NAME);
console.log(getRequiredSecret('JWT_SECRET'));
```

# config

To install dependencies:

```bash
bun install
```

To run:

```bash
bun ./packages/config/example/quickstart.ts
```

This project was created using `bun init` in bun v1.2.17. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
