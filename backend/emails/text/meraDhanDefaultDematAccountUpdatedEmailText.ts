export const meraDhanDefaultDematAccountUpdatedEmailText = (data: {
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
      This is to confirm that your demat account ending with <strong>${last4}</strong> has been successfully set as your default demat account on MeraDhan.
    </p>

    <p>
      All future securities transactions, including bond allocations and settlements, will be processed through this demat account unless you choose to update it again.
    </p>

    <p>
      If you did not make this change or notice anything unusual, please contact our support team immediately at
      <a href="mailto:support@meradhan.co">support@meradhan.co</a>.
    </p>

    <p>Warm regards,<br/>Team MeraDhan</p>

    <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 16px 0;" />

    <p style="font-size: 12px; color: #555;">
      This is a system-generated email. Please do not reply to this email.
    </p>
  </div>
  `.trim();
};

