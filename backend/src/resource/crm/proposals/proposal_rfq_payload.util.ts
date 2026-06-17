import { env } from "@packages/config/src/env";
import { appSchema } from "@root/schema";
import type { z } from "zod";

type SavedProposalRow = {
  isin: string;
  quantity: number;
  side: string;
  notes: string | null;
  linkedRfqParticipantCode: string | null;
  data: unknown;
};

/**
 * Build NSE add-ISIN payload from a saved CRM proposal snapshot.
 * For RFQ-participant proposals uses brokered deal (`dealType: B`) with
 * `clientCode` = participant UCC; direct deal for Meradhan customers.
 */
export function buildAddIsinPayloadFromProposal(
  proposal: SavedProposalRow,
): z.infer<typeof appSchema.rfq.addIsinSchema> {
  const snapshot =
    proposal.data && typeof proposal.data === "object"
      ? (proposal.data as Record<string, unknown>)
      : {};

  const fetched =
    snapshot.fetched && typeof snapshot.fetched === "object"
      ? (snapshot.fetched as Record<string, unknown>)
      : null;

  const bond =
    fetched?.bond && typeof fetched.bond === "object"
      ? (fetched.bond as Record<string, unknown>)
      : null;

  const dealAutofill =
    fetched?.dealAutofill && typeof fetched.dealAutofill === "object"
      ? (fetched.dealAutofill as Record<string, unknown>)
      : null;

  const suggested =
    dealAutofill?.suggested && typeof dealAutofill.suggested === "object"
      ? (dealAutofill.suggested as Record<string, unknown>)
      : null;

  const pricing =
    fetched?.pricing && typeof fetched.pricing === "object"
      ? (fetched.pricing as Record<string, unknown>)
      : null;

  const rfqParticipant =
    snapshot.rfqParticipant && typeof snapshot.rfqParticipant === "object"
      ? (snapshot.rfqParticipant as { code?: string })
      : null;

  const nseParticipantCode =
    proposal.linkedRfqParticipantCode?.trim() ||
    rfqParticipant?.code?.trim() ||
    null;

  const faceValueRaw =
    pricing?.faceValue ?? suggested?.faceValue ?? bond?.faceValue;
  const faceValue = Number(faceValueRaw);
  const quantum = Number.isFinite(faceValue)
    ? faceValue * proposal.quantity
    : NaN;
  const valueCrores =
    Number.isFinite(quantum) && quantum > 0 ? quantum / 10_000_000 : NaN;

  const yieldRaw =
    (dealAutofill?.pricing as Record<string, unknown> | null)?.finalYieldRaw ??
    suggested?.buyYield ??
    bond?.buyYield;

  let yieldValue = Number(yieldRaw);
  if (
    Boolean(snapshot.manualYieldEnabled) &&
    snapshot.manualYield != null &&
    String(snapshot.manualYield).trim() !== ""
  ) {
    const manual = Number(snapshot.manualYield);
    if (Number.isFinite(manual)) yieldValue = manual;
  }

  const settlementType = snapshot.settlementType === "T+1" ? "1" : "0";
  const buySell = proposal.side === "SELL" ? "S" : "B";

  const dealType = "D";
  const clientCode = env.CBRICS_LOGIN;

  return appSchema.rfq.addIsinSchema.parse({
    segment: "R",
    isin: proposal.isin,
    participantCode: env.CBRICS_LOGIN,
    dealType,
    clientCode,
    institutions: false,
    buySell,
    quoteType: "Y",
    settlementType,
    value: Number.isFinite(valueCrores) && valueCrores > 0 ? valueCrores : 1,
    quantity: proposal.quantity,
    yieldType: "YTM",
    yield: Number.isFinite(yieldValue) ? Math.max(0, yieldValue) : 0,
    calcMethod: "O",
    access: "2",
    gtdFlag: "Y",
    quoteNegotiable: "Y",
    valueNegotiable: "Y",
    remarks: proposal.notes?.trim() || undefined,
    participantList: nseParticipantCode ? [nseParticipantCode] : [clientCode],
  });
}

export function rfqManageRedirectFromCreateResult(created: unknown): string {
  const first = Array.isArray(created) ? created[0] : created;
  if (first && typeof first === "object" && "number" in first) {
    const number = String((first as { number: unknown }).number);
    if (number) return `/dashboard/rfqs/nse/manage/${number}`;
  }
  return "/dashboard/rfqs/nse";
}
