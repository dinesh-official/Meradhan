export const meraDhanKycSubmitAddClearingCorporationBankAccountsEmailText = (data: {
  customerName: string;
}) => {
  const name = data.customerName?.trim() || "Customer";

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>Dear ${name},</p>

    <p>
      To enable smooth settlement of your bond investments on MeraDhan, please add the attached
      ICCL / NCL clearing corporation bank accounts as beneficiaries in your net banking / mobile banking.
    </p>

    <p>
      Most banks require a cooling period of up to 24 hours after adding a new beneficiary. We therefore
      recommend adding these accounts in advance before placing your first investment.
    </p>

    <p><strong>Important:</strong></p>
    <ul>
      <li>Payments must be made only from your bank account registered with MeraDhan.</li>
      <li>Payments from third-party accounts may result in transaction failure.</li>
    </ul>

    <p>
      For any assistance, please contact us at
      <a href="mailto:contact@meradhan.co">contact@meradhan.co</a>.
    </p>

    <p>Warm regards,<br/>MeraDhan Team</p>

    <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 16px 0;" />

    <p style="font-size: 12px; color: #555;">
      Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in corporate
      debt securities, municipal debt securities/securitised debt instruments are subject to credit risks,
      market risks and default risks including delay and/or default in payment. Read all the offer related
      documents carefully.
    </p>

    <p style="font-size: 12px; color: #555; margin-top: 12px;">
      BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond
      Platform Provider (OBPP).<br/>
      SEBI Registration No.: INZ00033023<br/>
      NSE Member ID: 90480<br/>
      BSE Member ID: 6963
    </p>
  </div>
  `.trim();
};

