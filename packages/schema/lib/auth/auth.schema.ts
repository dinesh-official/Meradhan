import z from "zod";

export const loginZodSchema = z.object({
    email: z.email(),
    password: z.string().min(6)
});

export const registerZodSchema = z.object({
    name: z.string({error:"Name is required"}).min(2,{error:"Name must be at least 2 characters long"}).max(100),
    countryCode: z.string({error:"Country code is required"}).min(2,{error:"Country code must be at least 2 characters long"}).max(5,{error:"Country code must be at most 5 characters long"}),
    phoneNo: z.string({error:"Phone number is required"}).min(10,{ error: "Phone number must be at least 10 characters long" }).max(15,{ error: "Phone number must be at most 15 characters long" }),
    email: z.email({error:"Email is required"}),
    password: z.string({error:"Password is required"}).min(6,{error:"password is min 6 characters long"}),
},{error:"Not Acceptable data request data"});