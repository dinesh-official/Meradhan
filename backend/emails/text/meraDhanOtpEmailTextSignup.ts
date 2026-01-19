export function meraDhanOtpEmailTextSignup({
  userName = "User",
  otpCode = "******",
} = {}) {
  const year = new Date().getFullYear();

  return `
  Dear ${userName},
  
  Thank you for signing up for MeraDhan! To complete your registration, please use the following One-Time Password (OTP):
  
  ${otpCode}
  
  This OTP is valid for 3 minutes. Please do not share it with anyone.

  Warm regards,
  MeraDhan Team
  `.trim();
}
