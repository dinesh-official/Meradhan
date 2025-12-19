import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Tailwind,
  Img,
} from "@react-email/components";

export default function MeraDhanEmailVerificationEmail({
  userName = "User",
  verificationLink = "https://meradhan.com/verify-email?token=example123",
}: {
  userName?: string;
  verificationLink?: string;
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
                Verify Your Email Address
              </Text>

              <Text className="mb-6 text-gray-600">
                Dear <span className="font-semibold">{userName}</span>,
              </Text>

              <Text className="mb-4 text-gray-600">
                Thank you for signing up with{" "}
                <span className="font-medium">MeraDhan</span>! To complete your
                registration and secure your account, please verify your email
                address by clicking the button below:
              </Text>

              {/* Verification Button */}
              <div className="">
                <div className="block">
                  <a
                    href={verificationLink}
                    className="inline-block bg-[#002c59] px-8 py-3 rounded-md font-semibold text-white"
                  >
                    Verify Email Address
                  </a>
                </div>

                <div className="block mt-6">
                  <a href={verificationLink} className="text-xs">
                    {verificationLink}
                  </a>
                </div>
              </div>

              <Text className="mb-4 text-gray-600">
                This verification link will expire in{" "}
                <span className="font-semibold">30 minutes</span>. If you didn't
                create an account with MeraDhan, please ignore this email.
              </Text>

              <Text className="text-gray-500 text-sm">
                For security reasons, please verify your email to access all
                features of your account.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 py-4 text-center">
              <Text className="text-gray-400 text-xs">
                © {new Date().getFullYear()} MeraDhan. All rights reserved.
              </Text>
              <Text className="text-gray-400 text-xs">
                Need help?{" "}
                <a href="mailto:support@meradhan.co" className="text-[#002c59]">
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
