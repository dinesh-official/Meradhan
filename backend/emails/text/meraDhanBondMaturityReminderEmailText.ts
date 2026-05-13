function escapeHtml(s: string): string {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const meraDhanBondMaturityReminderEmailText = (data: {
  customerName: string;
  isin: string;
  securityName: string;
  maturityDate: string;
  supportEmail?: string;
}) => {
  const customerName = escapeHtml(data.customerName?.trim() || "Customer");
  const isin = escapeHtml(data.isin?.trim() || "");
  const securityName = escapeHtml(data.securityName?.trim() || "");
  const maturityDate = escapeHtml(data.maturityDate?.trim() || "");
  const supportEmail = (data.supportEmail?.trim() || "support@meradhan.co").trim();
  const supportEmailEsc = escapeHtml(supportEmail);

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>Dear ${customerName},</p>

    <p>This is to inform you that the following security held in your demat account is approaching its maturity date.</p>

    <p>
      <strong>Security Name:</strong> ${securityName}<br/>
      <strong>ISIN:</strong> ${isin}<br/>
      <strong>Scheduled Maturity Date:</strong> ${maturityDate}
    </p>

    <p>
      Upon maturity, the redemption amount is expected to be processed by the issuer / registrar and
      credited to your bank account registered with your demat account, in accordance with the issuer's
      redemption process.
    </p>

    <p>
      Please note that the maturity date mentioned above is based on the issuer's scheduled redemption
      date and is provided for informational purposes only. The actual credit of funds may vary
      depending on the issuer's processing timelines and applicable banking or holiday schedules.
    </p>

    <p>
      If you require any assistance, please contact us at
      <a href="mailto:${supportEmailEsc}">${supportEmailEsc}</a>.
    </p>

    <p>Warm regards,<br/><br/>Team MeraDhan</p>

    <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 16px 0;" />

    <p style="font-size: 11px; color: #555; margin: 0;">
      Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in
      corporate debt securities, municipal debt securities/securitised debt instruments are subject
      to credit risks, market risks and default risks including delay and/or default in payment.
      Read all the offer related documents carefully.
    </p>

    <p style="font-size: 12px; color: #555; margin-top: 12px;">
      BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond Platform Provider (OBPP).<br/>
      SEBI Registration No.: INZ000330234<br/>
      NSE Member ID: 90480<br/>
      BSE Member ID: 6963
    </p>
  </div>
  `.trim();
};
