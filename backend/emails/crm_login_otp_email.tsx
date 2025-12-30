import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Tailwind,
  Img
} from "@react-email/components";

export default function MeraDhanOtpEmail({
  userName = "User",
  otpCode = "123456",
}: {
  userName?: string;
  otpCode?: string;
}) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 max-w-[600px]">
            {/* Header */}
            <Img className="mx-auto pt-10 w-20 h-20" height={80} width={80} src="https://media.licdn.com/dms/image/v2/D560BAQGLNi0ZEPEzlQ/company-logo_200_200/company-logo_200_200/0/1738677843041/meradhan_logo?e=2147483647&v=beta&t=AXmwoFeu-aA9tTpz0r-BZlS1Cz1pDPhJ84WWl3V5gkQ" />
            {/* Body */}
            <Section className="px-10 pb-8 text-center">
              <Text className="mb-4 font-semibold text-gray-800 text-xl">
                Email Verification Code
              </Text>
              <Text className="mb-6 text-gray-600">
                Hello <span className="font-semibold">{userName}</span>,
              </Text>
              <Text className="mb-4 text-gray-600">
                Use the following One-Time Password (OTP) to verify your email
                address for <span className="font-medium">MeraDhan</span>:
              </Text>

              {/* OTP Box */}
              <div className="bg-[#002c59] mx-auto my-6 px-8 py-4 max-w-[200px] font-semibold text-white text-3xl text-center tracking-[10px]">
                {otpCode}
              </div>

              <Text className="mb-4 text-gray-600">
                This code is valid for the next{" "}
                <span className="font-semibold">5 minutes</span>. Please do not
                share it with anyone.
              </Text>
              <Text className="text-gray-500 text-sm">
                If you did not request this verification, please ignore this
                email.
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
