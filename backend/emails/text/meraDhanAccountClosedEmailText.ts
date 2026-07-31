const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const meraDhanAccountClosedEmailText = (data: {
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
      We would like to inform you that your request to delete your MeraDhan account
      (Client ID: <strong>${clientId}</strong>) has been successfully processed.
    </p>

    <p>
      If you have any questions, please feel free to contact our support team at
      <a href="mailto:${supportEmail}">${supportEmail}</a>.
    </p>

    <p>Kind regards,<br/><br/>Team MeraDhan</p>
  </div>`.trim();
};
