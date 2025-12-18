### **Core Stack**

- **Monorepo:** Modular structure with shared packages (`packages/`) for schema, API gateway, and configuration.
- **Languages:** TypeScript (Primary), Shell Scripting.
- **Runtimes:** [Bun](https://bun.sh/) (Primary for backend/scripts), [Node.js](https://nodejs.org/) (v20+).

### **Backend (`/backend`)**

- **Framework:** [Express.js](https://expressjs.com/) (Next-gen version 5.x).
- **Database & ORM:** [Prisma](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/) (Supabase integration).
- **Authentication:** [JWT](https://jwt.io/) (JSON Web Tokens) and [Argon2](https://github.com/ranisalt/node-argon2) for secure password hashing.
- **Validation:** [Zod](https://zod.dev/) for schema-based validation.
- **Caching & Background Jobs:** [Redis](https://redis.io/) via `ioredis` and [Bull](https://optimalbits.github.io/bull/) for queue management.
- **Emails:** [React Email](https://react.email/) with [Nodemailer](https://nodemailer.com/).
- **Utilities:**
  - [Axios](https://axios-http.com/) (HTTP Client).
  - [Multer](https://github.com/expressjs/multer) (File uploads).
  - [Node-cron](https://github.com/node-cron/node-cron) (Task scheduling).
  - [Razorpay](https://razorpay.com/) (Payment gateway).
  - [Cheerio](https://cheerio.js.org/) (Web scraping).
  - [XLSX](https://sheetjs.com/) & [Adm-zip](https://github.com/cthackers/adm-zip) (Data processing).

### **Frontend (`/frontend/crm` & `/frontend/meradhan`)**

- **Framework:** [Next.js](https://nextjs.org/) (v15.x) with App Router.
- **Library:** [React](https://react.dev/) (v19.x).
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) and [TanStack Query](https://tanstack.com/query/latest) (React Query).
- **UI Components:**
  - [Radix UI](https://www.radix-ui.com/) (Headless components).
  - [Tailwind CSS](https://tailwindcss.com/) (v4.0) for styling.
  - [Lucide React](https://lucide.dev/) (Icons).
  - [Recharts](https://recharts.org/) (Data visualization).
  - [TanStack Table](https://tanstack.com/table/v8) (Complex tables).
- **Forms:** [React Hook Form](https://react-hook-form.com/) with Zod resolvers.
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (in the client app).
- **Utilities:** `nuqs` (URL state management), `sonner` / `react-hot-toast` (Notifications), `date-fns` (Date manipulation).

### **DevOps & Infrastructure**

- **Containerization:** [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).
- **Process Management:** [PM2](https://pm2.keymetrics.io/) (via `ecosystem.config.js`).
- **Linting & Formatting:** [ESLint](https://eslint.org/) and [TypeScript ESLint](https://typescript-eslint.io/).
- **Environment Management:** [Dotenv](https://github.com/motdotla/dotenv).

### **Documentation & Design**

- **Diagrams:** [Draw.io](https://app.diagrams.net/) (`.drawio`) and [tldraw](https://www.tldraw.com/) (`.tldr`).
