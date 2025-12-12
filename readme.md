# MeraDhan

A MeraDhan building scalable full-stack TypeScript projects with Bun, Node.js, Next.js, and Prisma.

https://github.com/meradhan/MeraDhan

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Development Workflow](#development-workflow)
- [Database &amp; Prisma](#database--prisma)
- [Docker Usage](#docker-usage)
- [Customizing for Your Project](#customizing-for-your-project)
- [Scripts Overview](#scripts-overview)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Features

- Modular monorepo: backend, frontend, API gateway, shared schema
- Bun and Node.js support for fast builds and development
- Prisma ORM for PostgresSQL integration
- Next.js frontend with TypeScript
- Automated setup and dev scripts
- Dockerfile for easy containerization

---

## Project Structure

```
MeraDhan/
# MeraDhan — Full-stack TypeScript Monorepo

This repository is a starter/boilerplate for a scalable full-stack TypeScript application using Bun, Node (npm), Next.js, and Prisma. It contains a modular monorepo layout with a backend API, a Next.js frontend, shared packages, and utility scripts to bootstrap and run the project locally or in containers.

This README is written for the next developer who will pick up this project. It explains the structure, how to set up the environment, run services, work with Prisma, use Docker, and troubleshoot common issues.

## Table of contents

- Project layout
- Quick start (copy-paste)
- Prerequisites
- Setup (detailed)
- Running in development
- Running with Docker
- Prisma & Database
- Scripts and helpful commands
- Environment variables
- How the pieces fit together (architecture)
- Troubleshooting & tips
- Contributing and next steps

---

## Project layout (important folders)

Top-level structure (abridged):

```

/backend               # Backend API (TypeScript + Bun/Node + Prisma)
  /databases           # Prisma client & database setup (supabase schema included)
  /src                 # Application source (controllers, services, providers)

/frontend/crm          # Next.js frontend app

/packages              # Shared packages (apiGateway, schema)

/scripts               # Utility scripts (build/start)
Dockerfile             # Container image building
docker-compose.yml     # Local observability stack (Prometheus, Loki, Grafana)
setup.sh               # Installs dependencies and sets up Prisma
start-dev.sh           # Starts backend & frontend in new terminal tabs
readme.md              # This file

```

Read the code under `backend/src` and `frontend/crm/src` to see concrete controllers, routes and UI.

---

## Quick start (copy-paste)

1. Clone and open the repo:

```bash
git clone <repo-url> MeradhanProject
cd MeradhanProject
```

2. Install dependencies and set up Prisma (runs checks for bun/node/npm):

```bash
./setup.sh
```

3. Start development services (each in its own terminal tab):

```bash
./start-dev.sh
```

4. Backend (assumed): http://localhost:4000
   Frontend: http://localhost:3000 (or port shown by Next.js)

If you prefer to run services manually:

```bash
# Backend
cd backend
bun run dev

# Frontend
cd frontend/crm
npm run dev
```

---

## Prerequisites

- Bun (recommended for dev & scripts) — https://bun.sh/
- Node.js v20+ and npm
- Git
- PostgreSQL (or configure Prisma to use SQLite for quick local work)
- gnome-terminal (optional) if you want to use `start-dev.sh` as-is. You can edit the script to use your terminal.

Note: The project uses a mix of Bun and npm commands in scripts. `setup.sh` expects `bun` and `npm` to be available.

---

## Setup (detailed)

1. Ensure Bun and Node are installed.
2. Run the setup script from the repository root:

```bash
./setup.sh
```

What `setup.sh` does:

- Verifies Bun, Node and npm are installed
- Installs npm dependencies for `packages/schema`, `packages/apiGateway`, and `backend`
- Runs `bun install`/`npm install` where configured
- Generates Prisma client and attempts to push DB schema for `backend/databases/supabase` (check the script for the exact commands)

If `setup.sh` fails, inspect the printed error and re-run the failing command manually in that package directory.

---

## Running in development (how the pieces are executed)

Preferred: Use the convenience starter script:

```bash
./start-dev.sh
```

This opens new terminal tabs and runs:

- Backend: `bun run dev` inside `backend`
- Frontend: `npm run dev` inside `frontend/crm`

Manual run (if you don't have gnome-terminal):

```bash
cd backend
bun run dev

cd ../frontend/crm
npm run dev
```

Notes:

- Backend listens on port 4000 by default (see `backend/main.ts` / `start.ts` for the exact port). Adjust your environment variables as needed.
- Frontend is a Next.js app under `frontend/crm` and uses standard Next.js dev commands.

---

## Running with Docker

There is a top-level `Dockerfile` that sets up an Ubuntu image, installs Bun and Node, copies the repository and runs the `setup.sh` script. It then exposes port 4000 and runs the backend.

Build and run the image locally:

```bash
docker build -t meradhan .
docker run -p 4000:4000 meradhan
```

If you want to run the observability stack included in `docker-compose.yml` (Prometheus, Loki, Grafana):

```bash
docker compose up -d
```

The compose file only includes monitoring services. The backend container is built using the Dockerfile above.

---

## Prisma & Database

Prisma client and database schema live under `backend/databases/*`.

Common tasks:

- Generate Prisma client (from repo root):

```bash
cd backend/databases/supabase
npx prisma generate
```

- Pull schema from an existing DB:

```bash
npx prisma db pull
```

- Apply migrations (dev):

```bash
npx prisma migrate dev
```

- Push schema to DB (for non-migration workflow):

```bash
npx prisma db push
```

Make sure your `DATABASE_URL` environment variable is set in `backend/.env` (or system env) before performing DB operations.

Important: The repo includes a generated Prisma client under `backend/databases/generated/prisma/supabase` — keep it in sync with your Prisma schema when you make changes.

---

## Scripts and helpful commands

- ./setup.sh — Install dependencies and setup Prisma
- ./start-dev.sh — Start backend and frontend in separate terminal tabs (uses gnome-terminal)
- scripts/build.sh — Custom build helper (open to edit)
- scripts/start.sh — Custom start helper (open to edit)

Backend package scripts are in `backend/package.json`. Frontend scripts are in `frontend/crm/package.json`.

Use `bun`, `npm`, or `npx` as appropriate in each package.

---

## Environment variables (common)

Add a `.env` file to `backend` with at least these:

```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-jwt-secret"
PORT=4000
```

Frontend may also need environment variables in `frontend/crm/.env.local` (Next.js will pick up env vars with NEXT_PUBLIC_ prefix for the browser).

---

## How the pieces fit together (architecture)

- Backend (`backend`) is the primary API server. It uses TypeScript and Prisma for DB access. The `src` directory contains controllers, services, providers, middleware and other domain code.
- Frontend (`frontend/crm`) is a Next.js application that calls backend APIs (or the API gateway) to render pages and handle client interactions.
- Packages (`packages/`) contains shared code used by multiple modules (API gateway definitions, shared schema/types).
- Dockerfile and docker-compose are convenience files for containerization and monitoring.

Deployment note: This repo is structured as a monorepo; you can ship the backend and frontend separately as containers or host frontends on a static host while backend runs separately.

---

## Troubleshooting & tips

- If `./setup.sh` fails because `bun` isn't found, install Bun: https://bun.sh
- If you get Prisma or query engine errors, try regenerating the client manually in `backend/databases/supabase`:

```bash
cd backend/databases/supabase
npx prisma generate
```

- `start-dev.sh` requires `gnome-terminal`. If you use a different terminal (alacritty, konsole, iTerm, etc.), edit `start-dev.sh` to spawn tabs/windows in your terminal of choice.
- If backend doesn't start on port 4000, check `backend/.env` and `backend/main.ts` / `start.ts` for the configured port.
- For Node/Bun dependency inconsistencies, remove `node_modules`, `bun.lock` and reinstall in the failing package directory.

---

## Contributing and next steps

If you plan to continue work on this repo, consider these improvements:

- Add `.env.example` files for each package showing required variables
- Add a `Makefile` to unify common commands
- Add CI (GitHub Actions) that runs lint, typecheck, tests, and Prisma generate
- Add unit/integration tests for backend services and API routes
- Document API endpoints (Swagger/OpenAPI or a Postman collection)

If you want, I can:

- Add `.env.example` files for `backend` and `frontend/crm`
- Add a short contribution guide (CONTRIBUTING.md) and PR checklist
- Wire up a basic GitHub Action for lint & type-check

---

## Where to look in the code (jump-start)

- `backend/src/core/bootstrap/server.ts` — server bootstrap
- `backend/src/resource/*` — resource folders (auth, crm users)
- `backend/src/lib/provider/monitoring` — Prometheus/Loki providers
- `backend/databases/supabase/prisma/schema.prisma` — database schema
- `frontend/crm/src/app` — Next.js app entry

---

If anything is unclear or you want me to add example env files, CI, or automated scripts, tell me which you'd prefer and I will make the changes.

Happy hacking!
