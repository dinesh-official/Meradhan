# External Integrations

**Analysis Date:** 2025-03-08

## APIs & External Services

**Payments:**
- **Razorpay** – Payment orders, verification, webhooks
  - SDK: `razorpay` in `backend/package.json`
  - Usage: `backend/src/resource/customer/payment/payment.service.ts`, `payment.controller.ts` (webhook)
  - Auth: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (env)
  - IFSC lookup: `https://ifsc.razorpay.com/` – `backend/src/utils/razorpayIfsc.ts`, `packages/kyc-providers/src/digio/digio.ts`

**SMS:**
- **MSG91** – OTP (signup, login, verify)
  - Client: `axios` to `https://control.msg91.com/api/v5/flow/`
  - Implementation: `backend/src/communication/sms_communication.ts`
  - Auth: `MSG91_AUTH_KEY`; templates: `MSG91_SIGNUP_TEMPLATE`, `MSG91_LOGIN_TEMPLATE`, `MSG91_VERIFY_TEMPLATE`

**KYC / identity:**
- **KRA (NDML)** – PAN/KRA services
  - Config: `packages/config/src/env.ts` (KRA_*); usage in `packages/kyc-providers/src/kra/KraSDK.ts`, backend KRA routes and worker
  - Endpoints: UAT vs PROD (`KRA_ENV`); e.g. `https://kra.ndml.in/...`, `https://pilot.kra.ndml.in/...`
- **Digio** – PAN verification, e-sign, bank verification
  - Client: `packages/kyc-providers/src/digio/digio.ts` (axios; Basic auth via `DIGIO_USERNAME_PASS`)
  - Base URL: sandbox `https://ext.digio.in:444` or prod `https://api.digio.in`; env `NEXT_PUBLIC_DIGIO`
- **NSDL / NDSL** – Depository/KYC
  - Env: `NDSL_REQUESTOR_ID`, `NSDL_SECRET_KEY`, `NSDL_MODE`
  - Usage: `packages/kyc-providers` (NSDLApi), `backend/src/resource/customer/kyc/kyc_process/kyc_provider.ts`
- **CDSL** – Depository
  - Env: `CDSL_AES_KEY`, `ENTITY_ID`, `CDSL_MODE`
  - Usage: `packages/kyc-providers` (CDSLApi), same KYC provider

**NSE / RFQ:**
- **CBRICS** – NSE CBRICS integration
  - Env: `CBRICS_DOMAIN`, `CBRICS_LOGIN`, `CBRICS_PASSWORD`, `CBRICS_ENV` (UAT/PROD)
  - RFQ-specific: `RFQ_CBRICS_*` optional env
  - Usage: `backend/src/modules/RFQ/nse/nse_CBRICS.ts`, `backend/src/resource/crm/refq/nse/cbrics/`, participant manager

**CMS:**
- **Strapi** – Headless CMS and GraphQL
  - API: `STRAPI_API_URL`, `STRAPI_API_TOKEN` (backend uploads in `backend/src/resource/common/controller.ts`)
  - Frontend: `NEXT_PUBLIC_STRAPI_HOST_URL` (meradhan/crm `base.urls.ts`); GraphQL proxy at `frontend/meradhan/src/app/api/cms/graphql/route.ts` using `GRAPHQL_KEY`; Apollo client in `frontend/meradhan/src/core/connection/apollo-client.ts`
  - Internal URLs: `STRAPI_INTERNAL_URL` or `CMS_INTERNAL_URL` for server-side GraphQL

**Other:**
- **DhangPT** – Optional; `NEXT_PUBLIC_DHANGPT_URL` in meradhan `base.urls.ts` (default `https://dhangpt.meradhan.co`)

## Data Storage

**Databases:**
- **PostgreSQL**
  - Connection: `DATABASE_URL`; Prisma also uses `DIRECT_URL` (see `backend/databases/postgres/prisma/schema/schema.prisma` and CI workflows)
  - Client: Prisma; schema `backend/databases/postgres/prisma/schema/schema.prisma`, generated client `backend/databases/../generated/prisma/postgres`
  - Single DB used by backend; `backend/src/core/database/database.ts` exports `db.dataBase`

**File Storage:**
- **S3-compatible** (e.g. AWS S3 or Supabase Storage)
  - Env: `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION` (default `ap-south-1`), `S3_ENDPOINT`, `S3_BUCKET_NAME` (default `documents`)
  - Client: `@aws-sdk/client-s3` in `backend/src/modules/file_upload/s3_file_uploader.ts`, `backend/src/resource/common/routes.ts` (GetObject)

**Caching:**
- **Redis** – Session/queue backend and key-value cache
  - Env: `REDIS_HOST`, `REDIS_PORT`; optional `REDIS_USERNAME`, `REDIS_PASSWORD`
  - Client: `ioredis` in `backend/src/store/queue_store.ts`; cache abstraction in `backend/src/store/redis_store.ts` (KeyValueStore, Bull queues)

## Authentication & Identity

**Customer app (meradhan):**
- **NextAuth (Auth.js) 5** – `frontend/meradhan/src/core/auth/auth.ts`
  - Providers: Google, Facebook, Microsoft Entra ID
  - Custom page: `signIn: "/login"`
- **Backend session/JWT** – Cookie and JWT for API; middleware validates session via backend (`NEXT_PUBLIC_BACKEND_HOST_URL` + `/api/customer/session` in `frontend/meradhan/src/middleware.ts`)

**CRM:**
- Backend API auth (JWT/cookies); `frontend/crm/src/middleware.ts` uses `NEXT_PUBLIC_BACKEND_HOST_URL`

**Backend:**
- JWT: `jsonwebtoken`; secret `JWT_SECRET`; optional `PASSWORD_PEPPER` for hashing
- Auth middleware: `backend/src/middlewares/auth_middleware.ts`; cookie config `backend/src/config/cookie.ts` (domain `.meradhan.co` in production)

## Monitoring & Observability

**Metrics:**
- **Prometheus** – `prom-client` in `backend/src/modules/monitoring/prometheus.ts`; default metrics and response-time recording from `backend/main.ts`

**Logs:**
- **Winston** – General logging
- **Loki** – Optional; `winston-loki` in `backend/src/modules/monitoring/loki_log_tracking.ts`; `LOKI_URL` (default `http://34.47.136.227:3100`), `LOKI_JOB_NAME` (default `Backend`)

**Error tracking:**
- Not detected (no Sentry or similar in explored files)

## CI/CD & Deployment

**Hosting:**
- Not inferred from codebase; deployment uses GitHub Actions and env/secrets (e.g. `DEV_DIRECT_URL`, `DIRECT_URL` in workflows)

**CI:**
- GitHub Actions – `.github/workflows/` (e.g. `backend.yaml`, `prod.yaml`, `stage_be.yaml`, `stage_crm.yaml`, `stage_FE.yaml`, `stage_worker.yaml`, `worker.yaml`, `meradhanfe.yaml`)

## Environment Configuration

**Required / notable env vars (from `packages/config/src/env.ts` and usage):**
- Base: `NEXT_PUBLIC_HOST_URL`, `PORT`, `JWT_SECRET`
- DB: `DATABASE_URL`; Prisma also needs `DIRECT_URL` (set in CI, not in config package schema)
- Redis: `REDIS_HOST`, `REDIS_PORT`; optional `REDIS_USERNAME`, `REDIS_PASSWORD`
- KRA: `KRA_USERNAME`, `KRA_PASSWORD`, `KRA_PASS_KEY`, `KRA_OKRA_CD_MI_ID`, `KRA_ENV`, `KRA_MOB_NO`
- MSG91: `MSG91_AUTH_KEY`, `MSG91_SIGNUP_TEMPLATE`, `MSG91_LOGIN_TEMPLATE`, `MSG91_VERIFY_TEMPLATE`
- SMTP: `SMTP_SENDER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- CBRICS: `CBRICS_DOMAIN`, `CBRICS_LOGIN`, `CBRICS_ENV`, `CBRICS_PASSWORD`; optional `RFQ_CBRICS_*`
- Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- Digio: `DIGIO_USERNAME_PASS`; optional `NEXT_PUBLIC_DIGIO`
- NDSL/NSDL: `NDSL_REQUESTOR_ID`, `NSDL_SECRET_KEY`, `NSDL_MODE`
- CDSL: `CDSL_AES_KEY`, `ENTITY_ID`, `CDSL_MODE`
- S3: `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_ENDPOINT`, `S3_BUCKET_NAME`
- Strapi: `STRAPI_API_TOKEN`, `STRAPI_API_URL`
- Frontend: `NEXT_PUBLIC_BACKEND_HOST_URL`, `NEXT_PUBLIC_STRAPI_HOST_URL`, `NEXT_PUBLIC_CRM_HOST_URL`, `NEXT_PUBLIC_BACKEND_IP_URL`; meradhan GraphQL: `GRAPHQL_KEY`; optional `STRAPI_INTERNAL_URL`, `CMS_INTERNAL_URL`
- Optional: `STAMP_DUTY_RATE`, `PASSWORD_PEPPER`, `LOKI_URL`, `LOKI_JOB_NAME`

**Secrets:**
- Stored in repo env (e.g. `.env`) and GitHub Actions secrets; no in-repo secret files read.

## Webhooks & Callbacks

**Incoming:**
- **Razorpay** – `POST /api/customer/payment/webhook`; signature header `x-razorpay-signature`; verified with `RAZORPAY_WEBHOOK_SECRET` in `backend/src/resource/customer/payment/payment.controller.ts` and `payment.service.ts`; raw body required
- **NSE CBRICS** – `POST /api/webhook/nse/cbrics/notification`; rate-limited; signature verification not yet implemented (see `backend/src/modules/RFQ/nse/webhook_notification.routes.ts`)
- **NSE RFQs** – `POST /api/webhook/nse/rfqs/notification`; same rate-limit and TODO as above

**Outgoing:**
- Not detected (no outbound webhook dispatcher in explored code)

---

*Integration audit: 2025-03-08*
