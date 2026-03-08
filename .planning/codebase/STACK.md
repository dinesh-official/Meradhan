# Technology Stack

**Analysis Date:** 2025-03-08

## Languages

**Primary:**
- TypeScript 5.x – Backend (`backend/`), frontends (`frontend/meradhan/`, `frontend/crm/`), shared packages (`packages/schema`, `packages/apiGateway`, `packages/config`, `packages/kyc-providers`)

**Secondary:**
- JavaScript – Config (e.g. `ecosystem.config.js`)

## Runtime

**Environment:**
- **Backend:** Bun (scripts: `bun run main.ts`, `bun run --watch main.ts`); see `backend/package.json`
- **Frontends:** Node.js (Next.js); npm used for install/scripts

**Package Manager:**
- Backend: Bun – lockfile: `backend/bun.lock`
- Frontends & packages: npm – lockfiles: `frontend/meradhan/package-lock.json`, `frontend/crm/package-lock.json`, `packages/*/package-lock.json`

## Frameworks

**Core:**
- **Backend:** Express 5.x – `backend/package.json`; entry `backend/main.ts`, server in `backend/src/core/bootstrap/server.ts`
- **Frontend (meradhan):** Next.js 15.5.x – `frontend/meradhan/package.json`; config `frontend/meradhan/next.config.ts`
- **Frontend (crm):** Next.js 15.5.x – `frontend/crm/package.json`; config `frontend/crm/next.config.ts`

**Testing:**
- Not detected (no Jest/Vitest in package.json scripts or config in explored files)

**Build/Dev:**
- TypeScript – `tsconfig.json` in backend, both frontends, and all packages
- ESLint 9.x – `eslint.config.ts` / `eslint.config.mjs` in backend, frontends, packages
- PostCSS + Tailwind CSS 4 – `frontend/meradhan/postcss.config.mjs`, `frontend/crm/postcss.config.mjs`
- Prisma – migrations and client generation; schema at `backend/databases/postgres/prisma/schema/schema.prisma`, config `backend/databases/postgres/.config/prisma.ts` (and `frontend/meradhan/prisma.config.ts`)

## Key Dependencies

**Critical:**
- **@prisma/client** (backend 6.16.x, meradhan 7.0.x) – PostgreSQL ORM; client generated to `backend/databases/../generated/prisma/postgres`
- **express** 5.x – HTTP API
- **next** 15.5.x – React framework for both frontends
- **react** / **react-dom** 19.2.x – UI
- **zod** 4.x – Validation and shared config env parsing in `packages/config/src/env.ts`
- **axios** 1.12+ – HTTP client (backend, apiGateway, kyc-providers, frontends)

**Infrastructure:**
- **ioredis** 5.x – Redis client; used via `backend/src/store/queue_store.ts` and `backend/src/store/redis_store.ts`
- **bull** 4.x – Job queues backed by Redis; queues in `backend/src/jobs/queue/worker_queues.ts`
- **@aws-sdk/client-s3** 3.x – S3-compatible storage; usage in `backend/src/modules/file_upload/s3_file_uploader.ts`, `backend/src/resource/common/routes.ts`
- **prisma** 6.16.x (backend) / 7.0.x (meradhan) – CLI and client
- **razorpay** 2.9.x – Payments; `backend/src/resource/customer/payment/payment.service.ts`
- **nodemailer** 7.x – Email; `backend/src/communication/email_communication.ts`
- **argon2** – Password hashing
- **jsonwebtoken** – JWT auth
- **prom-client** 15.x – Prometheus metrics; `backend/src/modules/monitoring/prometheus.ts`
- **winston** + **winston-loki** – Logging and Loki; `backend/src/modules/monitoring/loki_log_tracking.ts`

**Frontend (meradhan):**
- **next-auth** 5.x (beta) – Auth; `frontend/meradhan/src/core/auth/auth.ts` (Google, Facebook, Microsoft Entra ID)
- **@apollo/client** + **graphql** – Strapi GraphQL; `frontend/meradhan/src/core/connection/apollo-client.ts`
- **@tanstack/react-query** – Server state
- **@mui/material**, **@radix-ui/** – UI
- **react-hook-form** + **@hookform/resolvers** + **zod** – Forms
- **zustand** – Client state

**Frontend (crm):**
- **@tanstack/react-query**, **@tanstack/react-table** – Data and tables
- **@radix-ui/** – UI
- **react-hook-form** + **zod** – Forms
- **zustand** – Client state

**Shared packages:**
- **@root/schema** – Zod schemas and shared types
- **@root/apiGateway** – API client used by frontends
- **@packages/config** – Env validation (Zod) and constants; consumed by backend and kyc-providers
- **kyc-providers** – KRA, CKYC, NSDL, CDSL, Digio; used by backend

## Configuration

**Environment:**
- Single `.env` at repo root; loaded in `packages/config/src/env.ts` via `dotenv.config({ path: path.resolve(__dirname, "../../../", ".env") })`. Backend Prisma loads via `backend/databases/postgres/.config/prisma.ts` with `path.join(process.cwd(), "../../../.env")`.
- Env validated with Zod in `packages/config/src/env.ts`; export `env` and type `Env`.

**Build:**
- Backend: no separate build step; run with `bun run main.ts` (or `npm run start` in ecosystem).
- Frontends: `next build`; Next config: `frontend/meradhan/next.config.ts`, `frontend/crm/next.config.ts` (rewrites, images, webpack externals for meradhan).
- TS: `tsconfig.json` in `backend/`, `frontend/meradhan/`, `frontend/crm/`, `packages/schema/`, `packages/apiGateway/`, `packages/config/`, `packages/kyc-providers/`.

**Process management:**
- PM2 – `ecosystem.config.js` defines MeraDhan-Backend, MeraDhan-Worker, MeraDhan-CRM, MeraDhan-Client.

## Platform Requirements

**Development:**
- Bun (for backend), Node.js and npm (for frontends/packages), Redis, PostgreSQL. Env vars must satisfy `packages/config` schema.

**Production:**
- Same runtimes; deployment via GitHub Actions (e.g. `.github/workflows/backend.yaml`, `prod.yaml`, `stage_*.yaml`, `meradhanfe.yaml`, `worker.yaml`). PM2 runs backend, worker, and both Next apps.

---

*Stack analysis: 2025-03-08*
