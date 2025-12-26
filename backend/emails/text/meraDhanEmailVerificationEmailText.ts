export function meraDhanEmailVerificationEmailText({
  userName = "User",
  verificationLink = "#",
} = {}) {
  const year = new Date().getFullYear();

  return `
      <p>Dear <strong>${userName}</strong>,</p>
  
      <p>
        Thank you for signing up with <strong>MeraDhan</strong>!
        To complete your registration and secure your account,
        please verify your email address by clicking the link below:
      </p>
  
      <p>
        <a href="${verificationLink}">${verificationLink}</a>
      </p>
  
      <p>
        This verification link will expire in <strong>30 minutes</strong>.
        If you didn't create an account with MeraDhan, please ignore this email.
      </p>
  
      <p>
        For security reasons, please verify your email to access all features of your account.
      </p>
  
      <p>
        Warm regards,<br />
        <strong>The MeraDhan Team</strong>
      </p>
  
      <p>
        © ${year} MeraDhan. All rights reserved.
      </p>
  `.trim();
}
