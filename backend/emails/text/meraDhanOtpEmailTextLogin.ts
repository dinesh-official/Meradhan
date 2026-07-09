export function meraDhanOtpEmailTextLogin({
  userName = "User",
  otpCode = "******",
} = {}) {
  const year = new Date().getFullYear();

  return `
  Dear ${userName},
  
  ${otpCode} is your One-Time Password (OTP) for logging into MeraDhan.
  
  This OTP is valid for 3 minutes. Please do not share it with anyone.

  Best regards,
  MeraDhan Team
  `.trim();
}
