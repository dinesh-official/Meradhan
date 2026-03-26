export function meraDhanForgotPasswordEmailText({
  userName = "User",
  resetLink = "#",
} = {}) {
  const year = new Date().getFullYear();

  return `Dear ${userName},
  
We received a request to reset your password for your MeraDhan account. Click the link below to set a new password:

<a href="${resetLink}">${resetLink}</a>

This link is valid for 30 minutes. If you didn’t request this, you can safely ignore this email.

For assistance, feel free to contact our support team at support@meradhan.co.

Best regards
MeraDhan Team
`.trim();
}
