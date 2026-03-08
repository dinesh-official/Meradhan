# Structure

**Analysis Date:** 2025-03-08

## Directory Layout

**Root:** Monorepo with `backend/`, `frontend/`, `packages/`, `tests/`, `docs/`, `_docs/`.

```
MeraDhan/
├── backend/                 # Express API, jobs, DB
├── frontend/
│   ├── crm/                 # Internal CRM Next.js app
│   └── meradhan/            # Customer-facing Next.js app
├── packages/
│   ├── apiGateway/          # Typed API client (ApiCallerClient)
│   ├── config/              # Env and config
│   ├── kyc-providers/       # KYC provider integrations
│   ├── schema/              # Zod schemas
│   └── dp-id-lookup/        # DP ID lookup
├── tests/                   # Ad-hoc / load tests
├── docs/                    # Project docs
└── _docs/                   # Reference (e.g. refq, NDML KRA)
```

## Key Locations

| Purpose | Path |
|--------|------|
| Backend entry | `backend/main.ts` |
| Backend routes/bootstrap | `backend/src/core/bootstrap/server.ts`, `backend/src/resource/*` |
| CRM app root | `frontend/crm/src/app/` |
| MeraDhan app root | `frontend/meradhan/src/app/` |
| API client | `packages/apiGateway/src/core/connection/apiCaller.ts` |
| Shared schemas | `packages/schema/` |
| Prisma schema / generated | `backend/databases/postgres/` |
| Middlewares | `backend/src/middlewares/`, frontend `middleware.ts` |

## Naming Conventions

- **Backend:** snake_case files (e.g. `customer.controller.ts`, `orders.routes.ts`); resource folders by domain (`resource/crm/customers/`, `resource/customer/order/`).
- **Frontend:** PascalCase components, camelCase hooks/utils; feature-private folders with leading underscore (`_hooks/`, `_components/`).
- **Packages:** camelCase package names; `src/` for source, path aliases as in ARCHITECTURE.md.

## Where to Add Code

- **New backend API:** Add route in `backend/src/resource/<domain>/`, then controller/service/repo in same folder; register route in bootstrap.
- **New CRM page:** Add under `frontend/crm/src/app/(presentation)/dashboard/<feature>/`; use `apiClientCaller` or apiGateway.
- **New MeraDhan page:** Add under `frontend/meradhan/src/app/(<group>)/` (e.g. `(account)`, `(bonds)`); use shared layout and middleware.
- **New shared type/schema:** `packages/schema/`; consume from backend and apiGateway.
- **New integration:** Backend `backend/src/services/` or `backend/src/modules/`; env via `packages/config`.

## Special Directories

- `backend/uploads/`, `backend/public/documents/`, `backend/tmp-pdfs/`, `backend/tmp-orders-pdfs/`: file storage and temp PDFs.
- `backend/emails/`: email templates (e.g. text).
- `packages/kyc-providers/pdf/`: PDF templates (e.g. Orders).
- `_docs/`, `docs/`: documentation and reference material.

---

*Structure analysis: 2025-03-08*
