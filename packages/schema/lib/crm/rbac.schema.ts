import { z } from "zod";

export const createRoleSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z][A-Za-z0-9_]*$/, "Invalid role key format"),
  label: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
});

export const updateRoleSchema = z.object({
  label: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
});

export const createActionSchema = z.object({
  moduleId: z.number().int().positive(),
  key: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z][a-z0-9_.]*$/, "Invalid action key format"),
  label: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  isGlobal: z.boolean().optional(),
});

export const updateActionSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
});

export const saveActionPoliciesSchema = z.object({
  grants: z.record(z.string(), z.boolean()),
});
