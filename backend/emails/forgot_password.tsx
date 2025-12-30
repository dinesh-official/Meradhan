import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Tailwind,
  Img,
  Link,
} from "@react-email/components";

export default function MeraDhanForgotPasswordEmail({
  userName = "User",
  resetLink = "https://meradhan.com/reset-password?token=example123",
}: {
  userName?: string;
  resetLink?: string;
}) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 max-w-[600px]">
            {/* Header */}
            <Img
              className="mx-auto pt-10 w-20 h-20"
              height={80}
              width={80}
              src="https://media.licdn.com/dms/image/v2/D560BAQGLNi0ZEPEzlQ/company-logo_200_200/company-logo_200_200/0/1738677843041/meradhan_logo?e=2147483647&v=beta&t=AXmwoFeu-aA9tTpz0r-BZlS1Cz1pDPhJ84WWl3V5gkQ"
              alt="MeraDhan Logo"
            />

            {/* Body */}
            <Section className="px-10 pb-8 text-center">
              <Text className="mb-4 font-semibold text-gray-800 text-xl">
                Reset Your Password
              </Text>

              <Text className="mb-6 text-gray-600">
                Dear <span className="font-semibold">{userName}</span>,
              </Text>

              <Text className="mb-4 text-gray-600">
                We received a request to reset your password for your{" "}
                <span className="font-medium">MeraDhan</span> account. Click the
                button below to set a new password:
              </Text>

              {/* Reset Button */}
              <div className="">
                <div className="block">
                  <a
                    href={resetLink}
                    className="inline-block bg-[#002c59] px-8 py-3 rounded-md font-semibold text-white"
                  >
                    Reset Password
                  </a>
                </div>

                <div className="block mt-6">
                  <a href={resetLink} className="text-xs">
                    {resetLink}
                  </a>
                </div>
              </div>

              <Text className="mb-4 text-gray-600">
                This link will expire in{" "}
                <span className="font-semibold">30 minutes</span>. If you didn’t
                request a password reset, please ignore this email — your
                account will remain secure.
              </Text>

              <Text className="text-gray-500 text-sm">
                For security reasons, the reset link can be used only once.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 py-4 text-center">
              <Text className="text-gray-400 text-xs">
                © {new Date().getFullYear()} MeraDhan. All rights reserved.
              </Text>
              <Text className="text-gray-400 text-xs">
                Need help?{" "}
                <a
                  href="mailto:support@meradhan.co"
                  className="text-[#002c59]"
                >
                  Contact Support
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
