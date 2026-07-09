import path from "path";
import type { PrismaConfig } from "prisma";
import dotenv from "dotenv";
console.log(process.cwd());

dotenv.config({ path: path.join(process.cwd(), "../../../.env") });
export default {
  schema: path.join(process.cwd(), "prisma", "schema"),
} satisfies PrismaConfig;
