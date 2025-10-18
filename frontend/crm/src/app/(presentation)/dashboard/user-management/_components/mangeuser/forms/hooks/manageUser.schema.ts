import { ROLES } from "@/global/constants/role.constants";
import z from "zod";


export const userFormSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .max(120, "Full name is too long"),
  email: z.email({ message: "Invalid email address" })
    .min(1, "Email is required"),
  phoneNo: z
    .string()
    .min(10, "Enter a valid mobile umber")
    .max(16, "Mobile no is too long"),
  role: z.enum(ROLES)
});
