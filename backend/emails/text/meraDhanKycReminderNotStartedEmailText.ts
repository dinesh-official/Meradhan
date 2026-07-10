export const meraDhanKycReminderNotStartedEmailText = (data: {
  customerFullName: string;
  title?: "Mr." | "Ms.";
  startKycLink: string;
  supportEmail?: string;
}) => {
  const name = data.customerFullName?.trim() || "Customer";
  const title = data.title ? `${data.title} ` : "";
  const startKycLink =
    data.startKycLink?.trim() || "https://www.meradhan.co/dashboard/kyc";
  const supportEmail = data.supportEmail?.trim() || "support@meradhan.co";

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>Dear ${title}${name},</p>

    <p>Thank you for registering with MeraDhan.</p>

    <p>
      To start investing in bonds on the platform, please complete your KYC verification, which is required to activate your account.
    </p>

    <p>You can begin your KYC by clicking the link below:</p>

    <p><a href="${startKycLink}">${startKycLink}</a></p>

    <p>The process typically takes only a few minutes.</p>

    <p>
      If you require any assistance, please feel free to contact us at
      <a href="mailto:${supportEmail}">${supportEmail}</a>.
    </p>

    <p>Warm regards,<br/><br/>Team MeraDhan</p>

    <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 16px 0;" />

    <p style="font-size: 12px; color: #555; margin: 0;">
      Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt
      securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and
      default risks including delay and/or default in payment. Read all the offer related documents carefully.
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

