function escapeHtml(s: string): string {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const meraDhanBondCouponReminderEmailText = (data: {
  customerName: string;
  isin: string;
  securityName: string;
  couponDate: string;
  couponAmount: string;
  supportEmail?: string;
}) => {
  const customerName = escapeHtml(data.customerName?.trim() || "Customer");
  const isin = escapeHtml(data.isin?.trim() || "");
  const securityName = escapeHtml(data.securityName?.trim() || "");
  const couponDate = escapeHtml(data.couponDate?.trim() || "");
  const couponAmount = escapeHtml(data.couponAmount?.trim() || "");
  const supportEmail = (data.supportEmail?.trim() || "support@meradhan.co").trim();
  const supportEmailEsc = escapeHtml(supportEmail);

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>Dear ${customerName},</p>

    <p>We would like to inform you that a coupon payment is scheduled for the following security held in your demat account:</p>

    <p>
      <strong>Security Name:</strong> ${securityName}<br/>
      <strong>ISIN:</strong> ${isin}<br/>
      <strong>Scheduled Coupon Date:</strong> ${couponDate}<br/>
      <strong>Coupon Amount:</strong> ₹${couponAmount}
    </p>

    <p>
      The coupon payment will be credited by the issuer / registrar directly to your bank account
      registered with your demat account, in accordance with their payment process.
    </p>

    <p>
      Please note that the above coupon date and amount are indicative and provided for informational
      purposes only. The actual payment date and amount may vary depending on the issuer's processing
      timelines, applicable day count conventions, and may be adjusted if the scheduled date falls on
      a weekend, holiday, or due to other operational factors.
    </p>

    <p>
      If you require any assistance, please feel free to contact us at
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
