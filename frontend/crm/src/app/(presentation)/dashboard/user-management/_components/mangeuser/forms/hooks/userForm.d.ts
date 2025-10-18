import z from "zod";
import { userFormSchema } from "./manageUser.schema"; // adjust path as needed
import { useManageUserDataHook } from "./useManageUserDataHook";

export type UserFormData = z.infer<typeof userFormSchema>;

export type IUserDataFormHook = ReturnType<typeof useManageUserDataHook> 
