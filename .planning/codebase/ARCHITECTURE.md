# Architecture

**Analysis Date:** 2025-03-08

## Pattern Overview

**Overall:** Monorepo with a backend API (Express), two Next.js frontends (CRM and customer-facing MeraDhan), shared packages, and a separate worker process. Request flow follows Route → Controller → Service → Repo/DB; frontends call the backend via a typed API client from `@root/apiGateway`.

**Key Characteristics:**
- Backend: Express server with resource-based routing, role-based auth middleware, Prisma for DB, and centralized error/response handling.
- Frontends: Next.js App Router; CRM uses `@/` aliases and `apiClientCaller` (ApiCallerClient); MeraDhan uses route groups for auth, account, bonds, pages, tools, blog_news.
- Shared: `packages/apiGateway` (API client + types), `packages/schema` (Zod validation), `packages/config` (env), `packages/kyc-providers`; backend and frontends consume these via path aliases.

## Layers

**Backend (Express):**
- Purpose: HTTP API, auth, business logic, DB access, jobs.
- Location: `backend/`
- Contains: `main.ts` (entry), `src/core/bootstrap/server.ts`, `src/resource/*` (routes, controllers, services, repos), `src/services`, `src/middlewares`, `src/jobs`, `src/store`, `src/modules`.
- Depends on: `@packages/config`, `@root/schema`, `@databases/generated/prisma/postgres`.
- Used by: CRM and MeraDhan frontends via HTTP.

**Frontend CRM:**
- Purpose: Internal CRM UI (customers, leads, orders, RFQs, bonds, audit logs, user management).
- Location: `frontend/crm/`
- Contains: `src/app/(presentation)/*` (dashboard, login, logout), `src/core/connection/apiClientCaller.ts`, `src/global/*` (elements, constants, utils), `src/components/ui`, `src/hooks`.
- Depends on: `@root/apiGateway`, `@/global/*`, `@/core/*`, `@/components/*`, `@/hooks`.
- Used by: Operators only (dashboard-protected routes).

**Frontend MeraDhan:**
- Purpose: Customer-facing site (bonds, auth, account dashboard, KYC, orders, blog/news, tools, static pages).
- Location: `frontend/meradhan/`
- Contains: `src/app/(auth)`, `src/app/(account)/dashboard`, `src/app/(bonds)`, `src/app/(pages)`, `src/app/(tools)`, `src/app/(blog_news)`, `src/app/(others)`, `src/core/connection`, `src/core/auth`.
- Depends on: Backend APIs (session, customer, KYC, orders, etc.), `@/global/*`, `@/core/*`.
- Used by: End customers.

**Shared API client (apiGateway):**
- Purpose: Typed HTTP client and API modules for CRM and customer domains.
- Location: `packages/apiGateway/`
- Contains: `src/core/connection/apiCaller.ts` (ApiCallerClient), `src/core/api/*` (crm, meradhan, bonds, auditlogs, trash, auth), response types.
- Depends on: `@root/schema`, axios, zod.
- Used by: `frontend/crm` (via `apiClientCaller` from `@root/apiGateway`), and optionally MeraDhan.

**Schema & config:**
- Purpose: Validation (Zod) and environment/secrets.
- Location: `packages/schema/`, `packages/config/`
- Consumed by: Backend (e.g. `appSchema.customer.createNewCustomerSchema` in controllers), apiGateway, and backend env (`@packages/config/env`).

## Data Flow

**CRM request (e.g. list customers):**
1. User hits `/dashboard/customers`; Next.js middleware in `frontend/crm/src/middleware.ts` checks cookie token and session (calls backend `/api/session`).
2. Page component (e.g. under `frontend/crm/src/app/(presentation)/dashboard/customers/`) uses `apiClientCaller` (from `frontend/crm/src/core/connection/apiClientCaller.ts`, which wraps `ApiCallerClient` from `@root/apiGateway`) to call backend.
3. Backend route in `backend/src/resource/crm/customers/customers.routes.ts` (e.g. `GET /api/crm/customers`) runs `allowAccessMiddleware("CRM")` then `CustomerProfileController.filterCustomer`.
4. Controller in `customer.controller.ts` parses/validates with schema, calls `CustomerProfileService`, which uses `CustomerProfileRepo`; Repo uses `db` from `backend/src/core/database/database.ts` (Prisma).
5. Controller calls `res.sendResponse({ statusCode, responseData })` (response handler in `backend/src/core/bootstrap/response_handler.ts`).
6. Frontend receives JSON; React Query / hooks in `_hooks` or list views consume it and render.

**Customer (MeraDhan) auth flow:**
1. User hits `/login` or `/dashboard`; `frontend/meradhan/src/middleware.ts` validates token and optionally calls `NEXT_PUBLIC_BACKEND_HOST_URL/api/customer/session`.
2. Authenticated customer APIs (profile, KYC, orders) are under `backend/src/resource/customer/*` with `customerAuthRoutes`, `customerProfileRoutes`, `kycRoutes`, `orderRoutes`, etc.

**State management:**
- Server state: Backend is stateless; session/token in cookies; frontends use React Query (TanStack) and hooks that call apiGateway/backend.
- Client state: Local component state and shared hooks; CRM uses `@/global/stores` and `@/hooks`; no single global store pattern mandated.

## Key Abstractions

**ExpressServer (backend):**
- Purpose: Configure Express app, CORS, middlewares, routes, health, 404, error handler; start HTTP server.
- Location: `backend/src/core/bootstrap/server.ts`
- Pattern: Class implementing `IServer` / `IExpressRoute`; `addRoutes(Router[])`, `addMiddlewares()`, `start(cb)`.

**Resource (backend):**
- Purpose: One route group per domain (e.g. CRM customers, leads, RFQ, customer auth, KYC, orders, bonds).
- Examples: `backend/src/resource/crm/customers/` (customers.routes.ts, customer.controller.ts, customer.service.ts, customer.repo.ts), `backend/src/resource/customer/order/`, `backend/src/resource/crm/refq/nse/`.
- Pattern: Router → allowAccessMiddleware(roles) → controller method; controller uses service/repo and `appSchema` for validation; `res.sendResponse()` for success.

**ApiCallerClient (packages/apiGateway):**
- Purpose: Single axios-based client used by CRM to call backend; interceptors map errors to `ApiError`.
- Location: `packages/apiGateway/src/core/connection/apiCaller.ts`
- CRM usage: `frontend/crm/src/core/connection/apiClientCaller.ts` instantiates `new ApiCallerClient(API_LOCAL_URL)` and exports `apiClientCaller`; pages/hooks use `apiGateway` default export for namespaced APIs (e.g. `apiGateway.crm.customer`, `apiGateway.crmOrdersApi`).

**AllowOnlyView (CRM):**
- Purpose: Permission-gated wrapper for dashboard UI (e.g. `view:dashboard`).
- Location: `frontend/crm/src/global/elements/permissions/AllowOnlyView` (referenced in dashboard page).
- Pattern: Wraps children; used with `Workspace` (nav/shell) in dashboard pages.

**Workspace (CRM):**
- Purpose: Layout shell (nav sidebar) for dashboard.
- Location: `frontend/crm/src/global/elements/nav-sidebar/WorkSpace` (imported as `Workspace` in dashboard/page.tsx).

## Entry Points

**Backend:**
- Location: `backend/main.ts`
- Triggers: `npm run start` (or PM2 via `ecosystem.config.js` MeraDhan-Backend).
- Responsibilities: Create `ExpressServer(env.PORT)`, add all resource routes (crm, customer, bonds, auditlogs, trash, watchlist, KRA, NSE webhooks), connect DB via `checkConnectToDatabases()`, then `server.start()`.

**Worker:**
- Location: Backend; started via `npm run worker` (ecosystem.config.js MeraDhan-Worker).
- Responsibilities: Background jobs (e.g. KRA worker referenced in `backend/test.ts` and jobs under `backend/src/jobs`).

**CRM frontend:**
- Location: `frontend/crm/src/app/layout.tsx` (root layout), `frontend/crm/src/app/page.tsx` (root page), `frontend/crm/src/app/(presentation)/login/page.tsx`, `frontend/crm/src/app/(presentation)/dashboard/page.tsx`.
- Triggers: Next.js dev/build; middleware in `frontend/crm/src/middleware.ts` runs on each request (auth for `/dashboard`).

**MeraDhan frontend:**
- Location: `frontend/meradhan/src/app/layout.tsx` (root layout), `frontend/meradhan/src/app/(index)/page.tsx`, `frontend/meradhan/src/app/(auth)/login/page.tsx`, `frontend/meradhan/src/app/(account)/dashboard/page.tsx`.
- Triggers: Next.js; middleware in `frontend/meradhan/src/middleware.ts` (session, pathname header, redirects).

## Error Handling

**Strategy:** Centralized backend error middleware; frontend relies on API client throwing (e.g. ApiError) and React Query/hooks for loading/error state.

**Backend:**
- `backend/src/core/bootstrap/error_handler.ts` (or equivalent in bootstrap): handles `ZodError` (400 + validation message), `AxiosError` (safe message in prod), `AppError` (statusCode + code), and generic 500 with no internal leak in production.
- Controllers throw `AppError` from `@utils/error/AppError` (e.g. `HttpStatus`, `code`); services/repos throw or propagate.

**Frontend:**
- `packages/apiGateway` exposes `ApiError` from `src/core/connection/error`; axios interceptor rejects with `ApiError`.
- Pages/hooks use try/catch or React Query `isError`/`error` to show messages (e.g. toast).

## Cross-Cutting Concerns

**Logging:** Backend uses `@utils/logger/logger` (e.g. `logger.logInfo`, `logger.logError`). Frontend uses console or analytics as needed.

**Validation:** Backend uses Zod via `@root/schema` (e.g. `appSchema.customer.createNewCustomerSchema.parse(req.body)` in controllers). apiGateway and schema package use Zod for types/responses.

**Authentication:** Backend: `allowAccessMiddleware(roles)` in `backend/src/middlewares/auth_middleware.ts` (Bearer or cookie token, JWT verify, role check). CRM: middleware validates token and session for `/dashboard`. MeraDhan: middleware validates token and `/api/customer/session` for customer dashboard.

---

*Architecture analysis: 2025-03-08*
