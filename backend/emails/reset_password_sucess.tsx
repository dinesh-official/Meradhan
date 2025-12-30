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

export default function MeraDhanPasswordResetSuccessEmail({
  userName = "User",
  loginLink = "https://www.meradhan.com/login",
}: {
  userName?: string;
  loginLink?: string;
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
                Password Reset Successful
              </Text>

              <Text className="mb-6 text-gray-600">
                Dear <span className="font-semibold">{userName}</span>,
              </Text>

              <Text className="mb-4 text-gray-600">
                Your <span className="font-medium">MeraDhan</span> account
                password has been successfully reset. You can now log in to your
                account using your new password.
              </Text>

              {/* Login Button */}
              <div className="">
                <div className="block">
                  <Link
                    href={loginLink}
                    className="inline-block bg-[#002c59] px-8 py-3 rounded-md font-semibold text-white"
                  >
                    Go to Login
                  </Link>
                </div>

                <div className="block mt-6">
                  <Link href={loginLink} className="text-xs">
                    {loginLink}
                  </Link>
                </div>
              </div>

              <Text className="mt-6 mb-4 text-gray-600">
                If you didn’t perform this action, please{" "}
                <a
                  href="mailto:support@meradhan.co"
                  className="font-semibold text-[#002c59]"
                >
                  contact our support team
                </a>{" "}
                immediately to secure your account.
              </Text>

              <Text className="text-gray-500 text-sm">
                Always keep your account credentials private and never share
                them with anyone.
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
