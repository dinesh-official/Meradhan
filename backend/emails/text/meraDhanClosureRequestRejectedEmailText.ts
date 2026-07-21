export const meraDhanClosureRequestRejectedEmailText = (data: {
  customerName: string;
  salutation: string;
  supportEmail?: string;
}) => {
  const supportEmail = data.supportEmail?.trim() || "support@meradhan.co";
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>${data.salutation} ${data.customerName},</p>
    <p>Your recent account closure request could not be approved at this time.</p>
    <p>If you still wish to close your account, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
    <p>Warm regards,<br/><br/>Team MeraDhan</p>
  </div>`;
};
