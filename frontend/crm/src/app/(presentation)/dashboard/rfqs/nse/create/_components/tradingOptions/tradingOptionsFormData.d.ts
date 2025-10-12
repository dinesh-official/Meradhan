import { z } from "zod";
import { TradingOptionsSchema } from "./tradingOptionsFormData.schema";


export type TradingOptionsFormData = z.infer<typeof TradingOptionsSchema>;

export interface ITradingOptionsFormHook {
  state: TradingOptionsFormData;
  errors: Partial<Record<keyof TradingOptionsFormData, string[]>>;

  setTradingOptionsData: <K extends keyof TradingOptionsFormData>(
    key: K,
    value: TradingOptionsFormData[K]
  ) => void;

  resetTradingOptionsData: () => void;

  validateField: <K extends keyof TradingOptionsFormData>(
    key: K,
    value: TradingOptionsFormData[K]
  ) => void;

  validateTradingOptionsData: () => boolean;
}
