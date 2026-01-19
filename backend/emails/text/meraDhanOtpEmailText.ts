// Use this function to generate the OTP email  copy this code next email
export function meraDhanOtpEmailText({
  userName = "User",
  otpCode = "******",
} = {}) {
  const year = new Date().getFullYear();

  return `
  Hello ${userName},
  
  Use the following One-Time Password (OTP) to verify your email address for MeraDhan:
  
  ${otpCode}
  
  This code is valid for the next 3 minutes.
  Please do not share this code with anyone.
  
  If you did not request this verification, you can safely ignore this email.
  
  MeraDhan Team
  `.trim();
}
