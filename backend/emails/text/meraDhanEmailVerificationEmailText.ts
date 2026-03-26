export function meraDhanEmailVerificationEmailText({
  userName = "User",
  verificationLink = "#",
} = {}) {
  const year = new Date().getFullYear();

  return `
Dear ${userName},

Thank you for signing up with MeraDhan! To complete your registration and secure your account, please verify your email address by clicking the link below:

<a href="${verificationLink}">${verificationLink}</a>

If you didn't create an account with MeraDhan, please ignore this email. This verification link will expire in 30 minutes.

For security reasons, please verify your email to access all features of your account.

Warm regards,
The MeraDhan Team
`.trim();
}
