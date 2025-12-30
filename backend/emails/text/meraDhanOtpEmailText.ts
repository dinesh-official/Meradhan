export function meraDhanOtpEmailText({
  userName = "User",
  otpCode = "123456",
} = {}) {
  const year = new Date().getFullYear();

  return `

  Hello ${userName},
  
  Use the following One-Time Password (OTP) to verify your email address for MeraDhan:
  
  ${otpCode}
  
  This code is valid for the next 5 minutes.
  Please do not share this code with anyone.
  
  If you did not request this verification, you can safely ignore this email.
  
  —
  MeraDhan Team
  
  © ${year} MeraDhan. All rights reserved.
  Need help? Contact us at support@meradhan.co
  `.trim();
}
