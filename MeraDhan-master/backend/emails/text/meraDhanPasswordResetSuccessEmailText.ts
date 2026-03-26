export function meraDhanPasswordResetSuccessEmailText({
  userName = "User",
  loginLink = "https://www.meradhan.com/login",
} = {}) {
  const year = new Date().getFullYear();

  return `
      <p>Dear <strong>${userName}</strong>,</p>
  
      <p>
        Your <strong>MeraDhan</strong> account password has been successfully reset.
        You can now log in using your new password.
      </p>
  
      <p>
        Login here:
        <br />
        <a href="${loginLink}">
          ${loginLink}
        </a>
      </p>
  
      <p>
        If you did not perform this action, please
        <a href="mailto:support@meradhan.co">contact our support team</a>
        immediately to secure your account.
      </p>
  
      <p>
        Always keep your account credentials private and never share them with anyone.
      </p>
  
      <p>
        Warm regards,<br />
        <strong>The MeraDhan Team</strong>
      </p>
  `.trim();
}
