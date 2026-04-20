export const meraDhanKycApprovedEmailText = (data: {
  customerFullName: string;
  title?: "Mr." | "Ms.";
  loginLink: string;
  supportEmail?: string;
}) => {
  const name = data.customerFullName?.trim() || "Customer";
  const title = data.title ? `${data.title} ` : "";
  const loginLink = data.loginLink?.trim() || "https://www.meradhan.co/login";
  const supportEmail = data.supportEmail?.trim() || "support@meradhan.co";

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>Dear ${title}${name},</p>

    <p>We are pleased to inform you that your KYC verification has been successfully completed.</p>

    <p>Your account is now fully activated, and you may start investing in bonds on MeraDhan.</p>

    <p>
      Access your account here:<br/>
      <a href="${loginLink}">${loginLink}</a>
    </p>

    <p>
      If you require any assistance, please feel free to contact us at
      <a href="mailto:${supportEmail}">${supportEmail}</a>.
    </p>

    <p>Warm regards,<br/><br/>Team MeraDhan</p>

    <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 16px 0;" />

    <p style="font-size: 11px; color: #555; margin: 0;">
      Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt
      securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and
      default risks including delay and/or default in payment. Read all the offer related documents carefully.
    </p>

    <p style="font-size: 12px; color: #555; margin-top: 12px;">
      BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond Platform Provider (OBPP).<br/>
      SEBI Registration No.: INZ00033023<br/>
      NSE Member ID: 90480<br/>
      BSE Member ID: 6963
    </p>
  </div>
  `.trim();
};

