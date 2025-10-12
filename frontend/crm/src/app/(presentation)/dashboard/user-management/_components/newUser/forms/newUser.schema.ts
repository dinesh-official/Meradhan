import { ROLES } from "@/global/constants/role.constants";
import z from "zod";


export const userFormSchema = z.object({
  fullname: z
    .string()
    .min(1, "Full name is required")
    .max(120, "Full name is too long"),
  email: z.email({ message: "Invalid email address" })
    .min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  role: z.enum(ROLES)
});
