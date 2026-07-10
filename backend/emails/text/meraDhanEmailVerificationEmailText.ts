function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function meraDhanEmailVerificationEmailText({
  userName = "User",
  verificationLink = "#",
} = {}) {
  const safeName = escapeHtml(userName);
  const safeHref = escapeAttr(verificationLink);

  return `<p>Dear ${safeName},</p>
  <p>Thank you for signing up with MeraDhan! To complete your registration and secure your account, please verify your email address by clicking the link below:</p>
  <p><a href="${safeHref}" style="color:#002c59;">Verify your email</a></p>
  <p>If you did not create an account with MeraDhan, please ignore this email. This verification link will expire in 30 minutes.</p>
  <p>For security reasons, please verify your email to access all features of your account.</p>
  <p>Warm regards,<br />The MeraDhan Team</p>`;
}
