import { sendBackOfficeEmail } from "@communication/email_communication";
import { env } from "@packages/config/src/env";
import logger from "@utils/logger/logger";
import { AxiosError } from "axios";

/** Ops inbox for NSE RFQ settlement automation failures. */
const SETTLEMENT_AUTOMATION_ALERT_TO = env.CBRICS_ENV === "UAT" ? "sourav@meradhan.co" : "dl.sales@meradhan.co";

const STEP_LABELS: Record<string, string> = {
  ADD_ISIN: "Create RFQ (Add ISIN)",
  ACCEPT_NEGOTIATION: "Accept RFQ negotiation",
  PROPOSE_DEAL: "Create / propose deal",
  ACCEPT_OR_REJECT_DEAL: "Accept deal",
  ACCEPT_DEAL: "Accept deal",
  UPDATE_ORDER_STATUS: "Update order status",
  RAZORPAY_ROUTE_TRANSFER: "Razorpay route transfer",
  SETTLEMENT_BATCH: "Settlement batch",
  CREATE_RFQ: "Create RFQ (Add ISIN)",
};

function htmlEscape(s: string): string {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Extract a readable NSE / axios error payload for email + logs. */
export function formatNseApiError(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data != null) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }
  if (error instanceof Error) return error.message;
  if (error == null) return "Unknown error";
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

export function settlementStepLabel(step: string): string {
  return STEP_LABELS[step] ?? step;
}

export async function sendSettlementAutomationFailureEmail(params: {
  context: "ORDER" | "PROPOSAL";
  failedStep: string;
  error: unknown;
  orderId?: number | null;
  orderNumber?: string | null;
  isin?: string | null;
  quantity?: number | null;
  paymentId?: string | null;
  batchId?: string | null;
  proposalId?: number | null;
  rfqNumber?: string | null;
  customerName?: string | null;
  ucc?: string | null;
}): Promise<void> {
  try {
    const stepLabel = settlementStepLabel(params.failedStep);
    const nseError = formatNseApiError(params.error);
    const envPrefix = env.CBRICS_ENV === "UAT" ? "[UAT] " : "";
    const ref =
      params.orderNumber?.trim() ||
      (params.orderId != null ? `Order #${params.orderId}` : null) ||
      (params.proposalId != null ? `Proposal #${params.proposalId}` : "Unknown");

    const subject = `${envPrefix}[NSE Settlement Failed] ${ref} — ${stepLabel}`;

    const rows: Array<[string, string]> = [
      ["Flow", params.context === "PROPOSAL" ? "CRM proposal RFQ automation" : "Order payment → NSE settlement"],
      ["Failed step", stepLabel],
      ["Step code", params.failedStep],
    ];
    if (params.orderId != null) rows.push(["Order ID", String(params.orderId)]);
    if (params.orderNumber) rows.push(["Order number", params.orderNumber]);
    if (params.proposalId != null) rows.push(["Proposal ID", String(params.proposalId)]);
    if (params.isin) rows.push(["ISIN", params.isin]);
    if (params.quantity != null) rows.push(["Quantity", String(params.quantity)]);
    if (params.paymentId) rows.push(["Payment ID", params.paymentId]);
    if (params.batchId) rows.push(["Automation batch", params.batchId]);
    if (params.rfqNumber) rows.push(["RFQ number", params.rfqNumber]);
    if (params.customerName) rows.push(["Customer", params.customerName]);
    if (params.ucc) rows.push(["UCC", params.ucc]);

    const tableHtml = rows
      .map(
        ([label, value]) => `
      <tr>
        <td style="border:1px solid #ddd;padding:8px;color:#555;">${htmlEscape(label)}</td>
        <td style="border:1px solid #ddd;padding:8px;font-weight:600;">${htmlEscape(value)}</td>
      </tr>`,
      )
      .join("");

    const html = `
<div style="font-family:Arial,sans-serif;color:#111;line-height:1.45;max-width:720px;">
  <h2 style="margin:0 0 8px;color:#b91c1c;">NSE RFQ settlement automation failed</h2>
  <p style="margin:0 0 16px;color:#444;">
    An NSE API call broke during <strong>${htmlEscape(stepLabel)}</strong>.
    Review the error below and retry or fix manually in CRM.
  </p>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin-bottom:16px;">
    <tbody>${tableHtml}</tbody>
  </table>
  <h3 style="margin:0 0 8px;font-size:14px;">NSE / API error</h3>
  <pre style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px;overflow:auto;font-size:12px;white-space:pre-wrap;word-break:break-word;">${htmlEscape(nseError)}</pre>
  <p style="margin:16px 0 0;font-size:12px;color:#666;">
    CRM → Orders → settlement automation logs for full step history.
  </p>
</div>`.trim();

    const textLines = [
      "NSE RFQ settlement automation failed",
      "",
      ...rows.map(([k, v]) => `${k}: ${v}`),
      "",
      "NSE / API error:",
      nseError,
    ];

    await sendBackOfficeEmail({
      to: SETTLEMENT_AUTOMATION_ALERT_TO,
      from: "backoffice@meradhan.co",
      subject,
      html,
      text: textLines.join("\n"),
    });
  } catch (emailErr) {
    logger.logError("Failed to send settlement automation failure email", emailErr);
  }
}
