export function meraDhanOtpEmailTextEmailChange({
  userName = "User",
  otpCode = "******",
} = {}) {
  return `
  Dear ${userName},

  ${otpCode} is your One-Time Password (OTP) to confirm your new email address on MeraDhan.

  This OTP is valid for a few minutes. Please do not share it with anyone. After verification, you will sign in using this new email only.

  Best regards,
  MeraDhan Team
  `.trim();
}
