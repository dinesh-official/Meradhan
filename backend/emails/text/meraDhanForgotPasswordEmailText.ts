export function meraDhanForgotPasswordEmailText({
  userName = "User",
  resetLink = "#",
} = {}) {
  const year = new Date().getFullYear();

  return `<p>Dear <strong>${userName}</strong>,</p>
  
      <p>
        We received a request to reset the password for your
        <strong>MeraDhan</strong> account.
      </p>
  
      <p>To set a new password, open the link below:</p>
  
      <p>
        <a href="${resetLink}">
          ${resetLink}
        </a>
      </p>
  
      <p>
        This link will expire in <strong>30 minutes</strong> and can be used only once.
      </p>
  
      <p>
        If you did not request a password reset, please ignore this email —
        your account will remain secure.
      </p>
  
      <p>
        For help or questions, contact us at
        <a href="mailto:support@meradhan.com">support@meradhan.com</a>.
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
