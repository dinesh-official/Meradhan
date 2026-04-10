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
      <a href="https://www.meradhan.co/login">https://www.meradhan.co/login</a>
    </p>

    <p>
      If you need any assistance, please contact us at
      <a href="mailto:support@meradhan.co">support@meradhan.co</a>.
    </p>

    <p>Warm regards,<br/>Team MeraDhan</p>

    <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 16px 0;" />

    <p style="font-size: 12px; color: #555;">
      Disclaimer: This email is for informational purposes regarding your KYC submission status.
    </p>
  </div>
  `.trim();
};

