export const meraDhanKycSubmittedForVerificationEmailText = (data: {
  customerName: string;
  title?: "Mr." | "Ms.";
}) => {
  const name = data.customerName?.trim() || "Customer";
  const title = data.title ? `${data.title} ` : "";

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>Dear ${title}${name},</p>

    <p>Thank you for completing your KYC on MeraDhan.</p>

    <p>
      Your details have been successfully submitted for verification and are currently under review.
      This process may take some time depending on regulatory checks.
    </p>

    <p>We will notify you once the verification is completed.</p>

    <p>
      You may check your KYC status anytime by logging into your account:
      <a href="https://www.meradhan.co/dashboard/kyc">https://www.meradhan.co/dashboard/kyc</a>
    </p>

    <p>
      If you need any assistance, please contact us at
      <a href="mailto:support@meradhan.co">support@meradhan.co</a>.
    </p>

    <p>Warm regards,<br/>Team MeraDhan</p>

    <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 16px 0;" />

    <p style="font-size: 11px; color: #555; margin: 0;">
      Disclaimer : Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt
      securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and
      default risks including delay and/or default in payment. Read all the offer related documents carefully
    </p>
    <p style="font-size: 11px; color: #555; margin: 8px 0 0;">
      MeraDhan is a platform providing access to fixed income products and related information. We do not provide
      investment advisory services. Users are requested to make investment decisions based on their own assessment or
      consult their financial advisor.
    </p>
  </div>
  `.trim();
};

