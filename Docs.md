# MeraDhan — Developer Onboarding Guide

Welcome! 👋
This document is written for **new developers (freshers)** joining the MeraDhan project. By the end of this guide you should be able to:

1. Understand what MeraDhan is.
2. Understand how the code is organized.
3. Run the entire project on your own laptop.
4. Find the file you need to work on.
5. Make a contribution (commit + pull request) confidently.

> Read this end-to-end **once** before you write a single line of code. It will save you days of confusion.

---

## 1. What is MeraDhan?

MeraDhan is a **Bond / Fixed-Income investment platform** for Indian retail investors. It lets customers:

- Sign up and complete **KYC** (Know Your Customer) checks against Indian regulators (KRA, NSDL, CDSL).
- Browse and search **bonds** listed on NSE / BSE.
- Place **buy / sell orders** through the **RFQ (Request for Quote)** system.
- Track their **portfolio**, payments, and settlements.

It is also used internally by the company:

- A **CRM panel** is used by sales / ops staff to manage leads, partnerships, customers, and orders.
- **Background workers** sync bond data, send emails / SMS, and process settlements.

In short: **two web apps (Customer + CRM) + one backend API + background workers + Postgres + Redis**.

---

## 2. The Tech Stack (in plain English)

You don't need to be an expert in any of these on day one — just know the names so you can google them.

| Layer | Tool | Why we use it |
|---|---|---|
| Language | **TypeScript** | Type-safe JavaScript everywhere |
| Backend runtime | **Bun** (preferred) / Node 20+ | Fast TS runtime |
| Backend framework | **Express 5** | Routes & middleware |
| Database | **PostgreSQL** | Main data store |
| ORM | **Prisma** | Talk to Postgres with TS types |
| Cache & Queues | **Redis + Bull** | Background jobs (emails, KRA sync, etc.) |
| Auth (backend) | **JWT + Argon2** | Login tokens & password hashing |
| Validation | **Zod** | Validate API input |
| Frontend framework | **Next.js 15** (App Router) | Customer site & CRM |
| UI library | **React 19 + Tailwind CSS + Radix UI / shadcn** | Components & styling |
| Forms | **React Hook Form + Zod** | Form handling |
| Data fetching | **TanStack Query (React Query)** | API caching on the frontend |
| State | **Zustand** | Small global state stores |
| CMS | **Strapi (GraphQL)** | Blog / news content |
| DevOps | **PM2, Docker, GitHub Actions** | Run & deploy the apps |
| Monitoring | **Prometheus + Grafana + Loki + Winston** | Logs & metrics |

---

## 3. The Big Picture (Architecture)

```
                       ┌────────────────────────┐
                       │       Customers        │
                       │ (browser / mobile web) │
                       └───────────┬────────────┘
                                   │
              ┌────────────────────┴─────────────────────┐
              │                                          │
   ┌──────────▼──────────┐                   ┌───────────▼──────────┐
   │  meradhan (Next.js) │                   │     crm (Next.js)    │
   │  Customer website   │                   │   Internal CRM UI    │
   │  Port 4002          │                   │   Port 4001          │
   └──────────┬──────────┘                   └───────────┬──────────┘
              │                                          │
              └────────────────────┬─────────────────────┘
                                   │ HTTP (REST + JWT)
                          ┌────────▼────────┐
                          │  Backend API    │
                          │  Express + Bun  │
                          │  Port 4000      │
                          └────┬───────┬────┘
                               │       │
                  ┌────────────┘       └─────────────┐
                  │                                  │
          ┌───────▼────────┐                ┌────────▼────────┐
          │   PostgreSQL   │                │      Redis      │
          │   (Prisma)     │                │  (Bull queues)  │
          └────────────────┘                └────────┬────────┘
                                                     │
                                          ┌──────────▼──────────┐
                                          │     Worker Process  │
                                          │ (emails, SMS, KRA,  │
                                          │  order settlement)  │
                                          └─────────────────────┘
```

There are **4 long-running processes** in production (see [ecosystem.config.js](ecosystem.config.js)):

1. `MeraDhan-Backend` — the API
2. `MeraDhan-Worker` — background jobs
3. `MeraDhan-CRM` — internal Next.js app
4. `MeraDhan-Client` — customer-facing Next.js app

---

## 4. Folder Structure (what lives where)

This is a **monorepo** — multiple apps in one Git repo, sharing code through `packages/`.

```
MeraDhan-master/
├── backend/                ← Express API + worker (TypeScript / Bun)
│   ├── main.ts             ← API entry point. Registers all routes.
│   ├── src/
│   │   ├── core/           ← Bootstrap (server setup, DB connection)
│   │   ├── resource/       ← REST routes + controllers (the API surface)
│   │   ├── services/       ← Business logic (customer, orders, KYC…)
│   │   ├── modules/        ← Feature modules (RFQ, file upload, monitoring)
│   │   ├── jobs/           ← Background workers + cron jobs
│   │   ├── middlewares/    ← Auth, error handler, rate limit, etc.
│   │   ├── communication/  ← Email / SMS senders
│   │   ├── store/          ← Redis / queue helpers
│   │   ├── utils/          ← Logger, helpers
│   │   └── config/         ← Backend-only config
│   ├── databases/postgres/prisma/
│   │   ├── schema/         ← Prisma models split per domain (customer, orders…)
│   │   └── migrations/     ← Auto-generated SQL migrations
│   └── emails/             ← React Email templates
│
├── frontend/
│   ├── meradhan/           ← Customer-facing Next.js site (port 4002)
│   │   └── src/app/        ← App Router pages (auth, bonds, account…)
│   └── crm/                ← Internal CRM Next.js site (port 4001)
│       └── src/app/        ← App Router pages
│
├── packages/               ← Shared code used by backend + frontends
│   ├── schema/             ← Shared Zod schemas + TS types
│   ├── apiGateway/         ← Frontend HTTP client wrapper
│   ├── config/             ← Env loader (shared across apps)
│   ├── kyc-providers/      ← KYC integrations (KRA, NSDL, CDSL)
│   └── dp-id-lookup/       ← Demat (DP ID) lookup helpers
│
├── docker-compose.yml      ← Local infra (Redis, etc.)
├── docker-compose-new.yml  ← Full local stack (backend + crm + client)
├── ecosystem.config.js     ← PM2 process definitions (production)
├── setup.sh                ← One-shot installer for all packages
├── be-start.sh             ← Backend container start script (Prisma push + start)
└── readme.md               ← This file
```

> 🧠 **Mental model:** request comes in → **route** ([backend/src/resource](backend/src/resource)) → calls a **service** ([backend/src/services](backend/src/services)) → service uses **Prisma** to read/write the DB → response goes back.

---

## 5. Prerequisites — Install These Once

| Tool | Version | Install |
|---|---|---|
| **Git** | latest | https://git-scm.com |
| **Node.js** | 20 LTS or higher | https://nodejs.org |
| **Bun** | latest | `curl -fsSL https://bun.sh/install \| bash` |
| **PostgreSQL** | 14+ (or use a free cloud DB like Neon / Supabase) | https://www.postgresql.org/download |
| **Redis** | 7+ (or run via Docker) | https://redis.io/download |
| **Docker + Docker Compose** *(optional but recommended)* | latest | https://docs.docker.com/get-docker |
| **VS Code** *(recommended)* | latest | https://code.visualstudio.com |

Recommended VS Code extensions: **ESLint**, **Prisma**, **Tailwind CSS IntelliSense**, **GitLens**.

---

## 6. First-Time Setup (step by step)

### Step 1 — Clone the repo
```bash
git clone <repo-url>
cd MeraDhan-master
```

### Step 2 — Get the `.env` files
Environment files contain secrets (DB URLs, API keys). They are **NOT in Git**. Ask your team lead for:

- `.env` (root)
- `backend/.env`
- `frontend/meradhan/.env.local`
- `frontend/crm/.env.local`

You will need at minimum:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/meradhan
DIRECT_URL=postgresql://user:pass@localhost:5432/meradhan
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=enter-your-password
JWT_SECRET=some-long-random-string
PORT=4000
```

### Step 3 — Install all dependencies
There is a one-shot script that installs every package:
```bash
chmod +x setup.sh
./setup.sh
```
This installs: `packages/schema`, `packages/kyc-providers`, `packages/apiGateway`, `packages/config`, `backend`, `frontend/crm`, `frontend/meradhan`, and runs `prisma generate`.

### Step 4 — Set up the database
```bash
cd backend/databases/postgres
bunx prisma db push      # creates tables (no migration files needed for first-time)
# OR, to use real migrations:
bunx prisma migrate dev
```

### Step 5 — Start everything

**Option A — All-in-one with Docker (easiest):**
```bash
docker compose -f docker-compose-new.yml up -d
```
This brings up Redis + Backend + CRM + Customer site.

**Option B — Manual (gives you logs in 4 separate terminals):**
```bash
# Terminal 1 — Backend API
cd backend && bun run dev          # http://localhost:4000

# Terminal 2 — Background worker (emails, KRA, settlements…)
cd backend && bun run worker

# Terminal 3 — Customer website
cd frontend/meradhan && npm run dev   # http://localhost:4002

# Terminal 4 — CRM
cd frontend/crm && npm run dev        # http://localhost:4001
```

### Step 6 — Verify
Open in your browser:
- Customer site → http://localhost:4002
- CRM → http://localhost:4001
- Backend health → http://localhost:4000

If all three respond, you're ready. 🎉

---

## 7. Day-to-Day Commands (cheat sheet)

| What | Where | Command |
|---|---|---|
| Start backend (hot reload) | `backend/` | `bun run dev` |
| Start worker | `backend/` | `bun run worker` |
| Start customer site | `frontend/meradhan/` | `npm run dev` |
| Start CRM | `frontend/crm/` | `npm run dev` |
| Type-check | any package | `npm run check` |
| Lint | any package | `npm run lint` |
| Auto-fix lint | `backend/` | `npm run lint:fix` |
| Lint everything | repo root | `./lint-check-all.sh` |
| Generate Prisma client | `backend/` | `npm run db:generate` |
| Open Prisma Studio (DB GUI) | `backend/databases/postgres/` | `bunx prisma studio` |
| Preview email templates | `backend/` | `npm run email` |

---

## 8. Where Do I Find…?

| I want to… | Look in… |
|---|---|
| Add a new REST endpoint | [backend/src/resource](backend/src/resource) → create a `*.routes.ts` and register it in [backend/main.ts](backend/main.ts) |
| Change business logic for orders | [backend/src/services/order](backend/src/services/order) |
| Change KYC logic | [backend/src/services/customer/kyc](backend/src/services/customer/kyc) and [packages/kyc-providers](packages/kyc-providers) |
| Add a database table or column | [backend/databases/postgres/prisma/schema](backend/databases/postgres/prisma/schema) → run `prisma migrate dev` |
| Add a customer-facing page | [frontend/meradhan/src/app](frontend/meradhan/src/app) (Next.js App Router) |
| Add a CRM page | [frontend/crm/src/app](frontend/crm/src/app) |
| Add a shared type / Zod schema | [packages/schema](packages/schema) (used by both backend and frontend) |
| Add a background job | [backend/src/jobs](backend/src/jobs) |
| Change an email template | [backend/emails](backend/emails) (React Email) |
| Add an env variable | [packages/config](packages/config) — add it once, use it everywhere |
| Configure logging / metrics | [backend/src/modules/monitoring](backend/src/modules/monitoring), [backend/src/utils](backend/src/utils) |

---

## 9. Coding Conventions

- **Language:** TypeScript everywhere. Avoid `any`.
- **Imports:** Use the path aliases (`@core/...`, `@resource/...`, `@services/...`, `@modules/...`, `@utils/...`, `@packages/...`). Don't write long `../../../` paths.
- **Validation:** Every API input must be validated with **Zod** before it reaches a service.
- **Errors:** Throw typed errors and let the global error middleware handle them. Don't `res.status(500).send("error")` from inside controllers.
- **Naming:** `camelCase` for variables/functions, `PascalCase` for components and classes, `snake_case.routes.ts` is OK because that's the existing convention.
- **Formatting:** ESLint is the source of truth. Run `npm run lint:fix` before committing.
- **Commits:** small, focused, with a clear message: `feat(orders): add settlement retry`, `fix(kyc): handle null pan`, etc.
- **No secrets in Git.** Ever. Put them in `.env` only.

---

## 10. Git Workflow (how to contribute)

1. **Pull latest `main`:**
   ```bash
   git checkout main
   git pull
   ```
2. **Create a branch:**
   ```bash
   git checkout -b feature/your-short-description
   ```
3. **Code → test locally → lint:**
   ```bash
   npm run lint
   npm run check
   ```
4. **Commit:**
   ```bash
   git add <files>
   git commit -m "feat(area): what you changed"
   ```
5. **Push & open a Pull Request** on GitHub. Fill in *what* and *why*.
6. Wait for review. Address comments. Merge once approved.

> ❗ Never push directly to `main`. Always go through a PR.

---

## 11. Common Problems & Fixes

| Problem | Fix |
|---|---|
| `Prisma client out of date` | `cd backend && npm run db:generate` |
| `ECONNREFUSED 127.0.0.1:6379` | Redis isn't running. Start it (`docker compose up -d redis`) |
| `Cannot find module '@root/schema'` | You forgot `./setup.sh`. The shared package wasn't installed. |
| `Port 4000 already in use` | Another instance is running. Kill it: `lsof -ti:4000 \| xargs kill -9` |
| Frontend says "CORS error" | You're calling backend directly from the browser. Use the Next.js `/api/server/*` proxy instead. |
| `bun: command not found` | Install Bun (see Prerequisites). |
| Migration conflict | Talk to the team before running `prisma migrate reset` — it wipes the DB. |

---

## 12. Things You Should Read Next

- **Prisma schema models:** [backend/databases/postgres/prisma/schema](backend/databases/postgres/prisma/schema) — open `customer.prisma`, `orders.prisma`, `bonds.prisma` to understand the data model.
- **Backend route registry:** [backend/main.ts](backend/main.ts) — gives you a one-page view of every API route.
- **Notification module spec:** [docs/NOTIFICATION_MODULE_IMPLEMENTATION.md](docs/NOTIFICATION_MODULE_IMPLEMENTATION.md)
- **PM2 process layout:** [ecosystem.config.js](ecosystem.config.js)
- **Docker stack:** [docker-compose-new.yml](docker-compose-new.yml)

---

## 13. Glossary (terms you'll hear a lot)

| Term | Meaning |
|---|---|
| **Bond** | A debt instrument — what users buy on this platform |
| **RFQ** | Request For Quote — the NSE/BSE mechanism for negotiating bond prices |
| **KYC** | Know Your Customer — identity verification required by Indian law |
| **KRA** | KYC Registration Agency — third-party that stores KYC records |
| **NSDL / CDSL** | India's two depositories that hold demat shares & bonds |
| **DP ID** | Depository Participant ID — identifies a user's broker |
| **CBRICS** | NSE's bond trading API |
| **ISIN** | Unique 12-character code that identifies a security |
| **Settlement** | The day money + bond actually change hands after a trade |
| **CRM** | Customer Relationship Management — the internal admin panel |

---

## 14. Who to Ask

If you are stuck for **more than 30 minutes**, ask. Don't burn a whole day silently.

- Check this README first.
- Search the codebase (`Ctrl+Shift+F` in VS Code).
- Ask your buddy / team lead on Slack.
- For schema or DB questions, ask the backend lead before changing models.

---

**Welcome to the team — happy shipping! 🚀**
