export const meraDhanBankAccountSubmissionReceivedEmailText = (data: {
  customerName: string;
  title?: "Mr." | "Ms.";
  last4Digits: string;
}) => {
  const name = data.customerName?.trim() || "Customer";
  const title = data.title ? `${data.title} ` : "";
  const last4 = data.last4Digits?.trim() || "----";

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>Dear ${title}${name},</p>

    <p>
      We have received your request to add a bank account ending with ${last4} to your MeraDhan profile.
    </p>

    <p>
      Your request is currently under verification with the exchange and will be activated once approved.
      You will be notified upon completion.
    </p>

    <p>
      If you did not request this, please inform us immediately at
      <a href="mailto:support@meradhan.co">support@meradhan.co</a>.
    </p>

    <p>Warm regards,<br/>Team MeraDhan</p>

    <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 16px 0;" />

    <p style="font-size: 12px; color: #555;">
      Disclaimer: Bank account activation is subject to verification and approval by relevant exchange authorities.
    </p>
  </div>
  `.trim();
};

