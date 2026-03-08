# Coding Conventions

**Analysis Date:** 2025-03-08

## Naming Patterns

**Files (backend):**
- Use **snake_case** for most files: `customer.auth.service.ts`, `order.controller.ts`, `error_handler.ts`, `customer.auth.routes.ts`, `auditlogs.utility.ts`.
- Resource/domain grouping: `resource/customer/auth/`, `resource/crm/orders/`, `resource/customer/kyc/kyc_process/`.
- Suffixes indicate role: `.controller.ts`, `.service.ts`, `.routes.ts`, `.repo.ts`, `.middleware.ts`, `_middleware.ts`.

**Files (frontend – meradhan & crm):**
- Use **PascalCase** for React components: `LoginForm.tsx`, `IdentityValidationForm.tsx`, `OrderDetailsView.tsx`.
- Use **camelCase** for hooks and utilities: `useLoginFormHook.ts`, `usePanCardVerifyHook.ts`, `apiClientCaller.ts`, `url.utils.ts`.
- Feature-private folders use leading underscore: `_hooks/`, `_components/`, `_utils/`, `_helpers/`, `_elements/`.

**Functions:**
- **camelCase** everywhere: `contactSubmit`, `previewOrder`, `getOrderHistory`, `validateIfEmailOrPhoneNo`.
- Controllers use **arrow** or **async** handlers: `previewOrder = async (req, res) => { ... }` or `async contactSubmit(req, res) { ... }`.

**Variables:**
- **camelCase** for locals and parameters: `customerId`, `orderId`, `responseData`, `parsedItem`.
- **UPPER_SNAKE** for constants: `TOTAL_REQUESTS`, `COOKIE_OPTIONS`, `COOKIE`.

**Types:**
- **PascalCase** for types/interfaces: `AuthDataTypes`, `OrderPreviewItem`, `DataBaseSchema`.
- Backend type modules use `.d.ts` where appropriate: `token_interface.d.ts`, `hash_interface.d.ts`, `kyc.d.ts`.

## Code Style

**Formatting:**
- No Prettier config detected at repo root or in packages; rely on editor/ESLint.

**Linting:**
- **Backend** (`backend/eslint.config.ts`): ESLint 9 flat config, `@eslint/js` + `typescript-eslint` recommended. Entry points `main.ts` and `start.ts` forbid any `ExportNamedDeclaration` or `ExportDefaultDeclaration`. `databases/**`, `emails/**` ignored.
- **Frontends** (`frontend/meradhan/eslint.config.mjs`, `frontend/crm/eslint.config.mjs`): `eslint-config-next` with `next/core-web-vitals` and `next/typescript`; ignores `node_modules`, `.next`, `out`, `build`, `next-env.d.ts`.
- **Packages** (`packages/apiGateway`, `packages/kyc-providers`, `packages/schema`): ESLint flat config with `js/recommended` and `typescript-eslint.configs.recommended`.

**TypeScript:**
- Backend `tsconfig`: `strict: true`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`, `noEmit: true`.
- Frontend `tsconfig` (meradhan): `strict: true`, path alias `@/*` → `./src/*`.

## Import Organization

**Order (observed in backend):**
1. External packages (express, axios, zod, etc.)
2. Internal path-aliased modules (`@core/*`, `@utils/*`, `@resource/*`, `@middlewares/*`, `@packages/*`, `@root/schema`)
3. Relative imports (e.g. `./customer.auth.service`, `./controller`)

**Path aliases (backend – `backend/tsconfig.json`):**
- `@core/*` → `./src/core/*`
- `@utils/*` → `./src/utils/*`
- `@resource/*` → `./src/resource/*`
- `@modules/*` → `./src/modules/*`
- `@middlewares/*` → `./src/middlewares/*`
- `@jobs/*` → `./src/jobs/*`
- `@store/*` → `./src/store/*`
- `@services/*` → `./src/services/*`
- `@config/*` → `./src/config/*`
- `@databases/*` → `./databases/*`
- `@emails/*` → `./emails/*`
- `@packages/*` → `../packages/*`
- `@root/*` → `./src/*`
- `@types/*` → `./types/*`

**Path aliases (frontend meradhan):**
- `@/*` → `./src/*` (e.g. `@/core/connection/apiClientCaller`, `@/hooks/useAppCookie.hook`)

**Barrel files:** Used sparingly; examples: `packages/schema/index.ts`, `packages/kyc-providers/index.ts`, `frontend/meradhan/src/app/(pages)/contact-us/_components/index.ts`, `frontend/meradhan/src/analytics/index.ts`.

## Error Handling

**Backend:**
- Use **AppError** from `@utils/error/AppError` for business/HTTP errors: `throw new AppError("Unauthorized", { statusCode: HttpStatus.UNAUTHORIZED });` or `throw new AppError("Order not found", { code: "ORDER_NOT_FOUND" });`. `HttpStatus` enum is in the same file.
- **Zod** validation: `appSchema.*.parse(req.body)` or `appSchema.*.parse(req.query)` at controller boundary; uncaught `ZodError` is handled by global error handler.
- **Axios** errors: Let them propagate; global error handler in `backend/src/core/bootstrap/error_handler.ts` treats `AxiosError` and `ZodError` and never leaks upstream/PII in production.
- **Global handler** (`error_handler.ts`): Central handling for `ZodError` (400 + formatted issues), `AxiosError` (safe message only in prod), `AppError` (uses `err.statusCode` and `err.code`), and generic `Error` (500, safe message in prod). Always log full details internally; never expose stack or internal details to client in production.

**Frontend:**
- Next.js `error.tsx` at `frontend/meradhan/src/app/error.tsx`: in development shows error message and stack with copy; in production shows generic “Site is Under Maintenance” and Retry/Go Home. Use `error` and `reset` props as per Next.js App Router.

## Logging

**Backend:**
- **Logger:** Singleton `LokiLogsProvider` from `@utils/logger/logger` (winston + winston-loki). Use `logger.logInfo(message, ...meta)` and `logger.logError(message, ...meta)`; implementation also calls `console.info` / `console.error`.
- **Error handler** uses `console.error` for full error and stack; do not rely on console for general app logging—prefer `logger` from `@utils/logger/logger`.
- **CORS** and security-related events use `logger.logError` (e.g. blocked origin, blocked `/uploads` access).

## Comments

**When used:**
- Security notes: `// SECURITY:`, `// SECURITY: ⚠️` (e.g. rate limiting, missing signature verification, no static uploads in prod).
- TODOs: `// TODO: Implement signature verification`, `// TODO: Consider IP whitelisting`.
- Brief inline explanation for non-obvious logic or env-specific behavior (e.g. development-only static uploads).

**JSDoc/TSDoc:**
- Used sparingly. Examples: `packages/kyc-providers` (e.g. `/** Renders the bond order slip ... */`, `/** Label for the frequency ... */`), and some frontend hooks (e.g. `/** Custom Hook: useLoginFormHook ... */`). Prefer JSDoc for public APIs and non-obvious helpers.

## Function Design

**Size:** No strict limit observed; controllers and services can be long (e.g. `orders.controller.ts`). Prefer single-responsibility handlers and extract logic into services.

**Parameters:** Typed with Express `Request`, `Response`; request body/query validated via Zod schemas from `@root/schema` (e.g. `appSchema.order.OrderPreviewItemSchema.parse(req.body)`).

**Return values:** Controllers do not return response payloads; they call `res.sendResponse({ statusCode, message, responseData })` and optionally `return` for early exit. Service methods return domain data or throw `AppError`.

## Module Design

**Exports:**
- Backend **entry files** `main.ts` and `start.ts`: no exports (enforced by ESLint).
- Controllers: default export of class or named export of router; routes import controller class and instantiate (e.g. `const controller = new NseWebhookController();`).
- Routes: `export default router` (Express Router).
- Services: class or object exports; consumers instantiate or use singleton (e.g. `logger`).

**Response shape (backend):**
- Use the shared `res.sendResponse` middleware (`backend/src/core/bootstrap/response_handler.ts`). Signature: `res.sendResponse({ message?, statusCode, success?, responseData? })`. Response body: `{ statusCode, success, message, responseData }`. Success defaults to `statusCode` in 2xx.

## Validation

- **Backend:** Zod schemas live in `@root/schema` (packages/schema). Controllers parse input with `appSchema.<domain>.<SchemaName>.parse(...)`; invalid input throws and is handled by global error handler.
- **Frontend:** Zod used with react-hook-form resolvers and in schemas (e.g. `frontend/crm/src/app/(presentation)/dashboard/rfqs/nse/participants/create/_components/basic-details/basicDetails.schema.ts`).

## Client components (Next.js)

- Add `"use client";` at the top of any file that uses hooks, browser APIs, or client-only UI. Used consistently in `frontend/meradhan` and `frontend/crm` for interactive components (e.g. forms, modals, nav, analytics).

---

*Convention analysis: 2025-03-08*
