## Core Stack

- Monorepo: Modular structure with shared packages (packages/) for schema, API gateway, and configuration.
- Languages: TypeScript (Primary), Shell Scripting
- Runtimes: Bun (Primary for backend/scripts), Node.js (v20+)

### Strapi Cms

- DataBase: PostgreSQL
- API: GraphQL
- Storage : Local filesystem

### Backend (/backend)

- Framework: Express.js (Next-gen version 5.x).
- Database & ORM: Prisma with PostgreSQL.
- Authentication: JWT (JSON Web Tokens) and Argon2 for secure password hashing.
- Validation: Zod for schema-based validation.
- Caching & Background Jobs: Redis via ioredis and Bull for queue management.
- Emails: React Email with Nodemailer
- Utilities:
- Axios (HTTP Client).
- Multer (File uploads).
- Node-cron (Task scheduling).
- Razorpay (Payment gateway).
- Cheerio (Web scraping).
- XLSX & Adm-zip (Data processing).

### Frontend (/frontend/crm & /frontend/meradhan)

- Framework: Next.js (v15.x) with App Router.
- Library: React (v19.x).
- State Management: Zustand and TanStack Query (React Query).
- UI Components:
- Radix UI (Headless components).
- Tailwind CSS (v4.0) for styling.
- Lucide React (Icons).
- Recharts (Data visualization).
- TanStack Table (Complex tables).
- Forms: React Hook Form with Zod resolvers.
- Authentication: NextAuth.js (in the client app).
- Utilities: nuqs (URL state management), sonner / react-hot-toast (Notifications), date-fns (Date manipulation).

### DevOps & Infrastructure

- Process Management: PM2 (via ecosystem.config.js).
- Linting & Formatting: ESLint and TypeScript ESLint.
- Environment Management: Dotenv.
