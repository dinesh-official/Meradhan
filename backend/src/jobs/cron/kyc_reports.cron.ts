import cron from "node-cron";
import { EmailCommunication } from "@communication/email_communication";
import { db } from "@core/database/database";

const KYC_REPORT_RECIPIENT = "vikas.kukreja@meradhan.co";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function istNowParts(now = new Date()): { y: number; m: number; d: number } {
  // Convert to IST by shifting and reading UTC parts (same trick used elsewhere in repo).
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  return { y: ist.getUTCFullYear(), m: ist.getUTCMonth(), d: ist.getUTCDate() };
}

function istMidnightToUtcDate(y: number, m: number, d: number): Date {
  // Returns a Date that represents IST midnight for (y,m,d) converted to UTC instant.
  return new Date(Date.UTC(y, m, d, 0, 0, 0) - IST_OFFSET_MS);
}

function formatYmd(y: number, m: number, d: number): string {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function htmlEscape(s: string): string {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function buildKycSubmissionSummary(range: { from: Date; to: Date }) {
  const total = await db.dataBase.customerProfileDataModel.count({
    where: { kycSubmitDate: { gte: range.from, lt: range.to } },
  });

  // Group by current kycStatus for customers whose submitDate falls in range
  const byStatus = await db.dataBase.customerProfileDataModel.groupBy({
    by: ["kycStatus"],
    where: { kycSubmitDate: { gte: range.from, lt: range.to } },
    _count: { _all: true },
  });

  const rows = byStatus
    .slice()
    .sort((a, b) => String(a.kycStatus).localeCompare(String(b.kycStatus)))
    .map((r) => ({
      status: String(r.kycStatus),
      count: r._count._all,
    }));

  return { total, rows };
}

async function buildKycSummary(range: { from: Date; to: Date }) {
  const initiated = await db.dataBase.kYC_FLOW.count({
    where: {
      createdAt: { gte: range.from, lt: range.to },
      markExpired: false,
      userID: { not: null },
    },
  });

  const submitted = await db.dataBase.customerProfileDataModel.count({
    where: { kycSubmitDate: { gte: range.from, lt: range.to } },
  });

  const completed = await db.dataBase.customerProfileDataModel.count({
    where: {
      kycStatus: "VERIFIED",
      verifyDate: { gte: range.from, lt: range.to },
    },
  });

  const pendingByReason = await db.dataBase.kYC_FLOW.groupBy({
    by: ["currentStepName"],
    where: {
      createdAt: { gte: range.from, lt: range.to },
      markExpired: false,
      userID: { not: null },
      complete: false,
    },
    _count: { _all: true },
  });

  const pendingReasons = pendingByReason
    .slice()
    .sort((a, b) =>
      String(a.currentStepName ?? "").localeCompare(String(b.currentStepName ?? "")),
    )
    .map((r) => ({
      reason: String(r.currentStepName ?? "Unknown"),
      count: r._count._all,
    }));

  const pendingTotal = pendingReasons.reduce((sum, r) => sum + r.count, 0);

  return { initiated, submitted, completed, pendingTotal, pendingReasons };
}

function renderSummaryEmailHtml(opts: {
  title: string;
  subtitle: string;
  total: number;
  rows: Array<{ status: string; count: number }>;
  kycSummary: {
    initiated: number;
    submitted: number;
    completed: number;
    pendingTotal: number;
    pendingReasons: Array<{ reason: string; count: number }>;
  };
}) {
  const { title, subtitle, total, rows, kycSummary } = opts;

  return `
  <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.4;">
    <h2 style="margin: 0 0 8px;">${htmlEscape(title)}</h2>
    <p style="margin: 0 0 14px; color: #444;">${htmlEscape(subtitle)}</p>

    <h3 style="margin: 0 0 10px;">KYC Summary</h3>
    <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1px solid #ddd; width: 520px;">
      <thead>
        <tr style="background: #f6f6f6;">
          <th align="left" style="border: 1px solid #ddd;">Metric</th>
          <th align="right" style="border: 1px solid #ddd;">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd;">Total initiated</td>
          <td align="right" style="border: 1px solid #ddd;"><strong>${kycSummary.initiated}</strong></td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd;">Submitted</td>
          <td align="right" style="border: 1px solid #ddd;"><strong>${kycSummary.submitted}</strong></td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd;">Completed</td>
          <td align="right" style="border: 1px solid #ddd;"><strong>${kycSummary.completed}</strong></td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd;">Pending</td>
          <td align="right" style="border: 1px solid #ddd;"><strong>${kycSummary.pendingTotal}</strong></td>
        </tr>
      </tbody>
    </table>

    <div style="height: 14px;"></div>

    <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1px solid #ddd; width: 520px;">
      <thead>
        <tr style="background: #f6f6f6;">
          <th align="left" style="border: 1px solid #ddd;">Pending reason</th>
          <th align="right" style="border: 1px solid #ddd;">Count</th>
        </tr>
      </thead>
      <tbody>
        ${kycSummary.pendingReasons.length
      ? kycSummary.pendingReasons
        .map(
          (r) => `
          <tr>
            <td style="border: 1px solid #ddd;">${htmlEscape(r.reason)}</td>
            <td align="right" style="border: 1px solid #ddd;">${r.count}</td>
          </tr>
        `.trim(),
        )
        .join("\n")
      : `
        <tr>
          <td colspan="2" style="border: 1px solid #ddd; color: #666;">No pending KYCs initiated in this period.</td>
        </tr>
        `.trim()
    }
      </tbody>
    </table>

    <div style="height: 18px;"></div>

    <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1px solid #ddd; width: 520px;">
      <thead>
        <tr style="background: #f6f6f6;">
          <th align="left" style="border: 1px solid #ddd;">Metric</th>
          <th align="right" style="border: 1px solid #ddd;">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd;">Total KYC submissions</td>
          <td align="right" style="border: 1px solid #ddd;"><strong>${total}</strong></td>
        </tr>
      </tbody>
    </table>

    <div style="height: 14px;"></div>

    <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1px solid #ddd; width: 520px;">
      <thead>
        <tr style="background: #f6f6f6;">
          <th align="left" style="border: 1px solid #ddd;">Current KYC Status</th>
          <th align="right" style="border: 1px solid #ddd;">Count</th>
        </tr>
      </thead>
      <tbody>
        ${rows.length
      ? rows
        .map(
          (r) => `
          <tr>
            <td style="border: 1px solid #ddd;">${htmlEscape(r.status)}</td>
            <td align="right" style="border: 1px solid #ddd;">${r.count}</td>
          </tr>
        `.trim()
        )
        .join("\n")
      : `
        <tr>
          <td colspan="2" style="border: 1px solid #ddd; color: #666;">No submissions in this period.</td>
        </tr>
        `.trim()
    }
      </tbody>
    </table>

    <p style="margin: 14px 0 0; font-size: 12px; color: #666;">
      Note: Status breakdown uses the customer’s <em>current</em> KYC status for records whose <code>kycSubmitDate</code> falls in the period.
    </p>
  </div>
  `.trim();
}

async function sendKycReportEmail(params: {
  to: string;
  subject: string;
  title: string;
  subtitle: string;
  range: { from: Date; to: Date };
}) {
  const summary = await buildKycSubmissionSummary(params.range);
  const kycSummary = await buildKycSummary(params.range);
  const html = renderSummaryEmailHtml({
    title: params.title,
    subtitle: params.subtitle,
    total: summary.total,
    rows: summary.rows,
    kycSummary,
  });

  const emailer = new EmailCommunication();
  await emailer.sendEmail({
    to: params.to,
    subject: params.subject,
    html,
  });
}

// Weekly — Monday 9:00 AM IST — previous week (Mon..Sun)
cron.schedule(
  "0 9 * * 1",
  async () => {
    try {
      const { y, m, d } = istNowParts();
      const todayStart = istMidnightToUtcDate(y, m, d);
      const ist = new Date(todayStart.getTime() + IST_OFFSET_MS);
      const dow = ist.getUTCDay(); // 1=Mon ... 0=Sun
      const deltaDays = (dow + 6) % 7; // days since Monday
      const thisMondayStart = new Date(
        todayStart.getTime() - deltaDays * 24 * 60 * 60 * 1000,
      );
      const prevMondayStart = new Date(
        thisMondayStart.getTime() - 7 * 24 * 60 * 60 * 1000,
      );
      const prevWeekEnd = thisMondayStart;

      const startIst = new Date(prevMondayStart.getTime() + IST_OFFSET_MS);
      const endIst = new Date(prevWeekEnd.getTime() + IST_OFFSET_MS);
      const endInclusive = new Date(endIst.getTime() - 1);

      await sendKycReportEmail({
        to: KYC_REPORT_RECIPIENT,
        subject: `Weekly KYC Report - ${formatYmd(
          startIst.getUTCFullYear(),
          startIst.getUTCMonth(),
          startIst.getUTCDate(),
        )} to ${formatYmd(
          endInclusive.getUTCFullYear(),
          endInclusive.getUTCMonth(),
          endInclusive.getUTCDate(),
        )}`,
        title: "Weekly KYC Report",
        subtitle: `Period: ${formatYmd(
          startIst.getUTCFullYear(),
          startIst.getUTCMonth(),
          startIst.getUTCDate(),
        )} to ${formatYmd(
          endInclusive.getUTCFullYear(),
          endInclusive.getUTCMonth(),
          endInclusive.getUTCDate(),
        )} (IST)`,
        range: { from: prevMondayStart, to: prevWeekEnd },
      });
    } catch (error) {
      console.error("Weekly KYC report cron failed:", error);
    }
  },
  { timezone: "Asia/Kolkata" },
);
