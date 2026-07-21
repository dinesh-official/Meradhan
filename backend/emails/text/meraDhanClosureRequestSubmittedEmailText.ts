export const meraDhanClosureRequestSubmittedEmailText = (data: {
  customerName: string;
  salutation: string;
  supportEmail?: string;
}) => {
  const supportEmail = data.supportEmail?.trim() || "support@meradhan.co";
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <p>${data.salutation} ${data.customerName},</p>
    <p>We have received your request to close your MeraDhan account. Our team will review it shortly.</p>
    <p>You will receive another email once a decision has been made.</p>
    <p>If you have questions, contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
    <p>Warm regards,<br/><br/>Team MeraDhan</p>
  </div>`;
};
