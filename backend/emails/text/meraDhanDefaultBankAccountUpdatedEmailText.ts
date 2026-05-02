export const meraDhanDefaultBankAccountUpdatedEmailText = (data: {
  customerName: string;
  title?: "Mr." | "Ms.";
  last4Digits: string;
}) => {
  const name = data.customerName?.trim() || "Customer";
  const title = data.title ? `${data.title} ` : "";
  const last4 = data.last4Digits?.trim() || "----";

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p><strong>Subject:</strong> Default Bank Account Updated Successfully</p>

    <p>Dear ${title}${name},</p>

    <p>
      This is to confirm that your bank account ending with <strong>${last4}</strong> has been successfully set as your default bank account on MeraDhan.
    </p>

    <p>
      All future transactions, including investments and payouts, will be processed using this account unless you choose to update it again.
    </p>

    <p>
      If you did not make this change or notice anything unusual, please contact us on
      <a href="mailto:backoffice@meradhan.co">backoffice@meradhan.co</a> immediately.
    </p>

    <p>Warm regards,<br/>Team MeraDhan</p>

    <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 16px 0;" />

    <p style="font-size: 12px; color: #555;">
      This is a system-generated email. Please do not reply to this email.
    </p>
  </div>
  `.trim();
};

