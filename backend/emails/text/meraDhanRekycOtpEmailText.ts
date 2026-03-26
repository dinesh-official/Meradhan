export function meraDhanRekycOtpEmailText({
  userName = "User",
  otpCode = "******",
} = {}) {
  return `
Dear ${userName},

You requested to apply ReKYC for a customer in MeraDhan CRM.

Your One-Time Password (OTP) to confirm this action is: ${otpCode}

This OTP is valid for 5 minutes. If you did not request this, please ignore this email and do not share the code with anyone.

This step helps prevent accidental ReKYC requests.

Best regards,
MeraDhan CRM Team
  `.trim();
}
