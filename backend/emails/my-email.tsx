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
          <Container className="max-w-[600px] mx-auto my-10 bg-white  ">
            {/* Header */}
            <Img className="w-20 pt-10 h-20 mx-auto" height={80} width={80} src="https://media.licdn.com/dms/image/v2/D560BAQGLNi0ZEPEzlQ/company-logo_200_200/company-logo_200_200/0/1738677843041/meradhan_logo?e=2147483647&v=beta&t=AXmwoFeu-aA9tTpz0r-BZlS1Cz1pDPhJ84WWl3V5gkQ" />
            {/* Body */}
            <Section className="pb-8 text-center  px-10">
              <Text className="text-xl font-semibold text-gray-800 mb-4">
                Email Verification Code
              </Text>
              <Text className="text-gray-600 mb-6">
                Hello <span className="font-semibold">{userName}</span>,
              </Text>
              <Text className="text-gray-600 mb-4">
                Use the following One-Time Password (OTP) to verify your email
                address for <span className="font-medium">MeraDhan</span>:
              </Text>

              {/* OTP Box */}
              <div className=" bg-[#002c59] max-w-[200px] mx-auto text-white text-3xl font-semibold tracking-[10px] py-4 px-8 text-center my-6">
                {otpCode}
              </div>

              <Text className="text-gray-600 mb-4">
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
                  href="mailto:support@meradhan.com"
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
