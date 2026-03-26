import { cn } from "@/lib/utils";
import { Globe, Mail, Phone } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";

const whyChooseUs = [
  "One-Stop Platform – Learn, invest, and manage bonds effortlessly",
  "Trusted & Regulated – Backed by Bond Nest Capital India Securities Pvt Ltd",
  "Transparent & Low-Cost Transactions – No hidden charges, competitive pricing",
  "Expert Insights & Education – Market trends, research, and blogs",
  "Secure & User-Friendly Interface – A seamless investment experience",
  "Advanced Tools & Calculators – MeraDhan-GPT, Return Calculator, FD Calculator & more",
];
const WhyChooseUsSection = () => {
  return (
    <>
      <div className="bg-[#ebf6ff] py-10 mt-18">
        <section className="container">
          <div className="space-y-8 px-5 leading-relaxed">
            {/* Heading */}
            <h4
              className={cn(
                "font-medium text-3xl md:text-4xl",
                "quicksand-medium"
              )}
            >
              Why{" "}
              <span className="font-semibold text-[#F25C4C]">Choose Us?</span>
            </h4>

            {/* List */}
            <ul className="space-y-5">
              {whyChooseUs.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <FaCircleCheck
                    size={20}
                    className="text-[#7FABD2]"
                    strokeWidth={2}
                  />
                  <p className="text-[16px] text-slate-800 md:text-[17px]">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className=" mt-5">
        <div className="container">
          <div className="flex flex-col gap-6 px-4 py-12 md:py-16">
            <h5
              className={cn(
                "font-medium text-black text-2xl md:text-3xl",
                "quicksand-medium"
              )}
            >
              Join the Fixed Income Revolution with{" "}
              <span className="font-semibold text-[#F25C4C]">MeraDhan!</span>
            </h5>

            <p className="leading-relaxed">
              Empower your financial future with the stability and security of
              fixed income investments. Explore MeraDhan today and take your
              first step towards smart, sustainable investing.
            </p>

            {/* Contact Section */}
            <div className="flex flex-col gap-3 mt-4 text-gray-800">
              <div className="flex items-center gap-3">
                <Globe size={18} />
                <a
                  href="https://www.meradhan.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  www.MeraDhan.co
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} />
                <a
                  href="mailto:support@meradhan.co"
                  className="hover:underline"
                >
                  support@meradhan.co
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} />
                <a href="tel:+919873373195" className="hover:underline">
                  +91 9873373195
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyChooseUsSection;
