/**
 * Deridata live smoke test (read-only — no DB writes).
 *
 * Calls all 6 Deridata endpoints for one ISIN, runs each response through its
 * mapper, and prints ok/error + a snippet. Use this to validate real credentials,
 * IP whitelisting, and that our schemas/mappers match live payloads.
 *
 * Prereqs (in repo-root .env):
 *   DERIDATA_ENABLED=true
 *   DERIDATA_MERCHANT_ID=...        (from Deridata)
 *   DERIDATA_SECRET_KEY=...         (from Deridata)
 *   DERIDATA_MERCHANT_NAME=...      (from Deridata)
 *   DERIDATA_MERCHANT_EMAIL=...     (from Deridata)
 *   DERIDATA_PUBLIC_IP=...          (this machine's egress IP, whitelisted with Deridata)
 *   DERIDATA_BASE_URL=https://test.deridata.com   (UAT first!)
 *
 * Run from backend/:
 *   bun run scripts/deridata-smoke.ts INE467V07966
 */
import { deridataApiFromEnv } from "@modules/deridata/deridata.api";
import { mapIssueDetailToRow, mapIssueDetailToBonds } from "@modules/deridata/deridata.issue-detail.mapper";
import {
  mapCalculator,
  mapEbp,
  mapSecondaryTrades,
  mapSecurityCovenant,
  mapDocuments,
} from "@modules/deridata/deridata.mappers";

const isin = process.argv[2] ?? "INE467V07966";
const valueDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

function line() {
  console.log("─".repeat(70));
}

function show(label: string, result: { ok: boolean; [k: string]: unknown }, onOk?: () => void) {
  line();
  if (result.ok) {
    console.log(`✅ ${label}: OK`);
    onOk?.();
  } else {
    console.log(`❌ ${label}: FAILED  code=${(result as any).code}  error=${(result as any).error}`);
  }
}

async function main() {
  console.log(`\nDeridata smoke test — ISIN=${isin}  value_date=${valueDate}`);
  console.log(`base_url=${process.env.DERIDATA_BASE_URL ?? "(default prod)"}\n`);

  let api;
  try {
    api = deridataApiFromEnv();
  } catch (e) {
    console.error("Config error:", (e as Error).message);
    process.exit(1);
  }

  // 1. Issue Detail
  const issue = await api.getIssueDetail(isin);
  show("1. issue-detail", issue, () => {
    const row = mapIssueDetailToRow((issue as any).data);
    const bonds = mapIssueDetailToBonds((issue as any).data);
    console.log("   row.issuerName :", row.issuerName);
    console.log("   row.maturity   :", row.maturity);
    console.log("   row.coupon     :", row.coupon);
    console.log("   bonds.taxStatus:", bonds.taxStatus, " isListed:", bonds.isListed, " exchange:", bonds.exchangeListedOn);
  });

  // 2. Calculator (Yield to Price, ytm=10 as a probe)
  const calc = await api.calculate({
    isin,
    value_date: valueDate,
    amount: 100,
    yield_to_price: true,
    selected_yield: "ytm",
    ytm: 10,
    cashflow_shut_flag: false,
  });
  show("2. calculator", calc, () => {
    const { row, cashflows } = mapCalculator(
      isin,
      { valueDate, mode: "yield_to_price", selectedYield: "ytm", inputYield: 10 },
      (calc as any).data,
    );
    console.log("   clean_price:", row.cleanPrice, " dirty_price:", row.dirtyPrice, " xirr:", row.xirr);
    console.log("   cashflows  :", cashflows.length, "rows");
  });

  // 3. EBP
  const ebp = await api.getEbp(isin);
  show("3. ebp", ebp, () => {
    const rows = mapEbp((ebp as any).data);
    console.log("   ebp_items:", rows.length, rows[0] ? `(first: issueSize=${rows[0].issueSize}, ebp=${rows[0].ebp})` : "");
  });

  // 4. Secondary Trades
  const sec = await api.getSecondaryTrades(isin);
  show("4. secondary-trades", sec, () => {
    const { row, history } = mapSecondaryTrades((sec as any).data);
    console.log("   wayPercentage:", row.wayPercentage, " lastTradeDate:", row.lastTradeDate, " history:", history.length);
  });

  // 5. Security & Covenant
  const cov = await api.getSecurityCovenant(isin);
  show("5. security-covenant", cov, () => {
    const row = mapSecurityCovenant((cov as any).data);
    console.log("   securityCover:", row.securityCover, " guarantee:", row.guarantee);
    console.log("   covenants    :", { cad: row.covCadRatio, de: row.covDeRatio, nw: row.covMinNw });
  });

  // 6. Documents
  const docs = await api.getDocuments(isin);
  show("6. documents", docs, () => {
    const { pressReleases } = mapDocuments((docs as any).data);
    const imLink = (docs as any).data?.im_link;
    console.log("   im_link present:", Boolean(imLink), "(NOT persisted — 1hr URL)");
    console.log("   press_releases :", pressReleases.length);
  });

  line();
  console.log("\nDone. Re-run with a different ISIN: bun run scripts/deridata-smoke.ts <ISIN>\n");
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
