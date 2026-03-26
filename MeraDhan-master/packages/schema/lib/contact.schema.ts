import z from "zod";

export const contactSchema = z.object({
  fullName: z
    .string({ error: "First name is required" })
    .min(2, { message: "First name must be at least 2 characters" })
    .max(100, { message: "First name is too long" }),
  email: z.email({ message: "Enter a valid email" }),
  phone: z
    .string({ error: "Phone is required" })
    .min(1, { message: "Enter a valid phone no." })
    .min(6, { message: "Phone looks too short" })
    .max(15, { message: "Phone looks too long" })
    .regex(/^[0-9()+-\s]*$/, {
      message: "Phone must contain only numbers and + - ( ) spaces",
    }),
  enquiryType: z.string({ error: "Enquiry type is required" }),
  message: z
    .string({ error: "Message is required" })
    .min(10, { message: "Message must be at least 10 characters" }),
});
