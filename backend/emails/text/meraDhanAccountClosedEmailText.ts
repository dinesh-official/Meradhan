export const meraDhanAccountClosedEmailText = (data: {
  customerName: string;
  salutation: string;
  supportEmail?: string;
}) => {
  const supportEmail = data.supportEmail?.trim() || "support@meradhan.co";
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>${data.salutation} ${data.customerName},</p>
    <p>Your MeraDhan account has been closed as requested. You will no longer be able to log in.</p>
    <p>To open a new account, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
    <p>Warm regards,<br/><br/>Team MeraDhan</p>
  </div>`;
};
