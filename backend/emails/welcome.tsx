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

export default function MeraDhanWelcomeEmail({
  userName = "Member",
}: {
  userName?: string;
}) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 max-w-[600px]">

            {/* Body */}
            <Section className="px-10 pb-8">
         
              <Text className="mt-10 mb-4 text-gray-600">
                Dear <span className="font-semibold">{userName}</span>,
              </Text>

              <Text className="mb-6 text-gray-600 leading-relaxed">
                Congratulations on successfully signing up for{" "}
                <span className="font-medium">MeraDhan.co</span>! We're thrilled
                to have you join our community of smart investors.
              </Text>

              <Text className="mb-6 text-gray-600 leading-relaxed">
                At MeraDhan, we are committed to helping you grow your wealth
                through secure and reliable fixed-income investments. Whether
                you’re just starting your financial journey or looking to
                diversify your portfolio, we make investing easy, transparent,
                and rewarding.
              </Text>

              {/* Next Steps */}
              <div className="text-left">
                <Text className="mb-3 font-medium text-gray-800">
                  Here’s what you can do next:
                </Text>
                <ul className="text-gray-600 text-sm text-left list-disc">
                  <li className="mb-2">
                    <span className="font-medium text-gray-800" >Explore Opportunities:</span> Browse through our
                    curated investment plans designed for your financial goals.
                  </li>
                  <li className="mb-2">
                    <span className="font-medium text-gray-800" >Stay Updated:</span> Access expert insights and
                    tips to make informed investment decisions.
                  </li>
                  <li className="mb-0">
                    <span className="font-medium text-gray-800" >Track Growth:</span> Watch your investments grow
                    with confidence and peace of mind.
                  </li>
                </ul>
              </div>


              {/* Support */}
              <Text className="mb-4 text-gray-600 leading-relaxed">
                If you have any questions or need assistance, our support team
                is just a message away at{" "}
                <a
                  href="mailto:support@meradhan.co"
                  className="font-medium text-[#002c59]"
                >
                  support@meradhan.co
                </a>
                .
              </Text>

              <Text className="mb-4 text-gray-600 leading-relaxed">
                Welcome aboard! Let's make your financial dreams a reality.
              </Text>

              <Text className="mt-6 font-semibold text-gray-700">
                Warm regards,
              </Text>
              <Text className="font-medium text-gray-700">The MeraDhan Team</Text>

              <Text className="mt-4 text-gray-500 text-sm">
                Secure | Transparent | Rewarding
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
