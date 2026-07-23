const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const meraDhanClosureRequestAdminEmailText = (data: {
  requestId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  reasonText: string;
  reasonRemark?: string | null;
  submittedAt: Date | string;
  crmUrl?: string;
}) => {
  const customerName = escapeHtml(data.customerName?.trim() || "—");
  const customerEmail = escapeHtml(data.customerEmail?.trim() || "—");
  const customerPhone = data.customerPhone?.trim()
    ? escapeHtml(data.customerPhone.trim())
    : "—";
  const reasonText = escapeHtml(data.reasonText?.trim() || "—");
  const remark = data.reasonRemark?.trim();
  const submittedAt =
    data.submittedAt instanceof Date
      ? data.submittedAt.toISOString()
      : String(data.submittedAt);
  const crmUrl =
    data.crmUrl?.trim() || "https://crm.meradhan.co/dashboard/service-requests";

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>Hello Team,</p>

    <p>
      A customer has submitted an <strong>account closure request</strong> that
      requires review in CRM.
    </p>

    <table style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 16px 0;">
      <tr>
        <td style="padding: 6px 0; width: 160px; color: #555;">Request ID</td>
        <td style="padding: 6px 0;"><strong>#${data.requestId}</strong></td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #555;">Customer ID</td>
        <td style="padding: 6px 0;">${data.customerId}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #555;">Customer name</td>
        <td style="padding: 6px 0;">${customerName}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #555;">Email</td>
        <td style="padding: 6px 0;">
          <a href="mailto:${customerEmail}">${customerEmail}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #555;">Phone</td>
        <td style="padding: 6px 0;">${customerPhone}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #555;">Reason</td>
        <td style="padding: 6px 0;">${reasonText}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #555; vertical-align: top;">Remark</td>
        <td style="padding: 6px 0;">${remark ? escapeHtml(remark) : "—"}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #555;">Submitted at (UTC)</td>
        <td style="padding: 6px 0;">${escapeHtml(submittedAt)}</td>
      </tr>
    </table>

    <p>
      Review this request in CRM:
      <a href="${crmUrl}">${crmUrl}</a>
    </p>

    <p style="color: #555; font-size: 13px; margin-top: 24px;">
      This is an automated notification from MeraDhan.
    </p>
  </div>`.trim();
};
