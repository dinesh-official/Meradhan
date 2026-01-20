export function meraDhanWelcomeEmailText({ userName = "User" } = {}) {
  const year = new Date().getFullYear();

  return `<p>Dear ${userName},</p>

<p>
  Congratulations on successfully signing up for MeraDhan.co!
  We're excited to have you join our community of smart investors.
</p>

<p>
  At MeraDhan, we are committed to helping you grow your wealth through
  secure and reliable fixed-income investments. Whether you’re just
  starting your financial journey or looking to diversify your portfolio,
  we make investing easy, transparent, and rewarding.
</p>

<p>Here’s what you can do next:</p>

<ul>
  <li>
    <strong>Explore Opportunities:</strong>
    Browse through our curated investment plans designed for your financial goals.
  </li>
  <li>
    <strong>Stay Updated:</strong>
    Get access to expert insights and tips to make informed investment decisions.
  </li>
  <li>
    <strong>Track Growth:</strong>
    Watch your investments grow with confidence and peace of mind.
  </li>
</ul>

<p>
  If you have any questions or need assistance, our support team is just a
  message away at
  <a href="mailto:support@meradhan.co">support@meradhan.co</a>.
</p>

<p>
  Welcome aboard! Let’s make your financial dreams a reality.
</p>

<p>Warm regards,</p>

<p>
  The MeraDhan Team<br />
  Secure | Transparent | Rewarding
</p>
`.trim();
}
