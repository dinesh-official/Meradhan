import { z } from "zod";
import { bondSchema } from "./bondFormData.schema";


export type BondFormData = z.infer<typeof bondSchema>;

export type IBondDataFormHook = ReturnType<typeof useBondFormDataHook>;
