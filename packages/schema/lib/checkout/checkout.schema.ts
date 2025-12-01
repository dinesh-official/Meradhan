import z from "zod";

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      isin: z.string().min(1, "ISIN is required"),
      quantity: z.number().int().positive("Quantity must be greater than 0").min(1).max(10000),
    })
  ).min(1, "At least one item is required"),
});

export const webhookSchema = z.object({
  event: z.string(),
  entity: z.string(),
  data: z.object({
    payment: z.object({
      id: z.string(),
      order_id: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      method: z.string().optional(),
    }),
  }),
});
