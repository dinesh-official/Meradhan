"use client";

import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { DirectorsSection } from "./DirectorsSection";

export function KartasSection({ hook }: { hook: CorporateKycFormHook }) {
  return <DirectorsSection hook={hook} variant="kartas" />;
}
