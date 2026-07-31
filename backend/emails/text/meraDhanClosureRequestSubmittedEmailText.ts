const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const meraDhanClosureRequestSubmittedEmailText = (data: {
  customerName: string;
  salutation: string;
  clientId: string;
  supportEmail?: string;
}) => {
  const supportEmail = data.supportEmail?.trim() || "support@meradhan.co";
  const salutation = data.salutation?.trim() || "";
  const customerName = escapeHtml(data.customerName?.trim() || "Customer");
  const clientId = escapeHtml(data.clientId?.trim() || "—");
  const greeting = salutation
    ? `Dear ${escapeHtml(salutation)} ${customerName},`
    : `Dear ${customerName},`;

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>${greeting}</p>

    <p>
      We acknowledge receipt of your account deletion request for MeraDhan Client ID:
      <strong>${clientId}</strong>. Your request will be processed within 3 working days.
      Once the process is complete, we will send you a confirmation email.
    </p>

    <p>
      If you did not initiate this request or have any questions, please contact our
      support team immediately at
      <a href="mailto:${supportEmail}">${supportEmail}</a>.
    </p>

    <p>Kind regards,<br/><br/>Team MeraDhan</p>
  </div>`.trim();
};
