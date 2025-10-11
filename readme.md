
# ProjectStarterKit

A monorepo starter kit for building scalable full-stack TypeScript projects with Bun, Node.js, Next.js, and Prisma.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Development Workflow](#development-workflow)
- [Database & Prisma](#database--prisma)
- [Docker Usage](#docker-usage)
- [Customizing for Your Project](#customizing-for-your-project)
- [Scripts Overview](#scripts-overview)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Features

- Modular monorepo: backend, frontend, API gateway, shared schema
- Bun and Node.js support for fast builds and development
- Prisma ORM for PostgreSQL integration
- Next.js frontend with TypeScript
- Automated setup and dev scripts
- Dockerfile for easy containerization

---

## Project Structure

```
ProjectStarterKit/
├── backend/           # API server, business logic, Prisma integration
├── frontend/
│   └── client/        # Next.js frontend app
├── apiGateway/        # API gateway logic
├── schema/            # Shared validation schemas
├── scripts/           # Utility scripts for build/start
├── Dockerfile         # Containerization config
├── setup.sh           # Installs all dependencies
├── start-dev.sh       # Starts dev services in separate tabs
└── readme.md          # This guide
```

---

## Prerequisites

- **Bun** (https://bun.sh/)  
- **Node.js** (v20+)  
- **npm**  
- **PostgreSQL** (local or remote instance)  
- **gnome-terminal** (for start-dev.sh, or adapt for your terminal)

---

## Setup Instructions

1. **Clone the Repository**

	```bash
	git clone <your-repo-url> <your-project-name>
	cd <your-project-name>
	```

2. **Install Dependencies**

	Run the setup script to install all dependencies for each module:

	```bash
	./setup.sh
	```

	- Checks for Bun, Node.js, npm
	- Installs dependencies in `backend`, `frontend/client`, `apiGateway`, `schema`
	- Sets up Prisma in `backend/databases/postgress`

3. **Configure Environment Variables**

	- Copy `.env.example` (if available) to `.env` in `backend` and `frontend/client`
	- Set database URLs, secrets, and other config as needed

	Example for backend `.env`:
	```
	DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
	JWT_SECRET="your-secret"
	```

---

## Development Workflow

Start backend and frontend services in separate terminal tabs:

```bash
./start-dev.sh
```

- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:3002

You can also start services manually:

```bash
cd backend
bun run dev

cd ../frontend/client
npm run dev
```

---

## Database & Prisma

- **Prisma schema**: `backend/databases/postgress/prisma/schema.prisma`
- **Migrations**: `backend/databases/postgress/prisma/migrations/`
- **Local DB file**: `dev.db` (for SQLite) or configure for PostgreSQL

To update or generate Prisma client:

```bash
cd backend/databases/postgress
npx prisma db pull
npx prisma generate
```

To run migrations:

```bash
npx prisma migrate dev
```

---

## Docker Usage

Build and run the project in Docker:

```bash
docker build -t projectstarterkit .
docker run -p 4000:4000 projectstarterkit
```

- The Dockerfile installs Bun, Node.js, npm, and sets up all dependencies
- Adjust exposed ports as needed for your backend/frontend

---

## Customizing for Your Project

1. **Rename the project folder** and update `package.json` names in each module.
2. **Update environment variables** and Prisma schema for your use case.
3. **Add your own code** to `backend/src`, `frontend/client/src`, etc.
4. **Modify scripts** in `scripts/` or add new ones as needed.

---

## Scripts Overview

- `setup.sh`: Installs all dependencies and sets up Prisma
- `start-dev.sh`: Starts backend and frontend in dev mode (separate tabs)
- `scripts/build.sh`: Custom build script (edit as needed)
- `scripts/start.sh`: Custom start script (edit as needed)

---

## Troubleshooting

- **Missing dependencies**: Rerun `setup.sh`
- **Database errors**: Check `.env` config and ensure PostgreSQL is running
- **Terminal issues**: Adapt `start-dev.sh` for your terminal if not using GNOME

---

## Contributing

Feel free to fork, customize, and contribute improvements via pull requests!

---

This starter kit is designed to help you launch new TypeScript full-stack projects quickly. Customize as needed for your own requirements!

---

Let me know if you want even more detail on any section, or specific examples for configuration, deployment, or code!
