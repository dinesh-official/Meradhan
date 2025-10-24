import { quicksand } from '@/global/font/font';
import { cn } from '@/lib/utils';
import Image from 'next/image'
import React from 'react'

const coreValues = [
  {
    id: 1,
    title: "Financial Education First",
    desc: "We believe in empowering investors with knowledge. MeraDhan is committed to providing easy-to-understand, high-quality content and resources to make fixed income investing accessible to all.",
    icon: "/assets/financial_Education.png",
  },
  {
    id: 2,
    title: "Trust & Transparency",
    desc: "Integrity is at the heart of our operations. We ensure clear, unbiased information and seamless transactions so investors can make well-informed decisions.",
    icon: "/assets/trust_Transparency.png",
  },
  {
    id: 3,
    title: "Innovation & Accessibility",
    desc: "We leverage cutting-edge technology to simplify bond investing, making it accessible to a diverse range of investors—from beginners to experts.",
    icon: "/assets/innovation_accessibility.png",
  },
  {
    id: 4,
    title: "Investor-Centric Approach",
    desc: "Our platform is built for investors, by experts. Every feature, service, and educational resource is tailored to provide a superior user experience.",
    icon: "/assets/investor-centric.png",
  },
  {
    id: 5,
    title: "Long-Term Wealth Creation",
    desc: "We advocate sustainable and stable investment opportunities, helping individuals build long-term wealth with fixed income instruments.",
    icon: "/assets/long_term.png",
  },
];

const CoreValuesSection = () => {
  return (
   <section className="max-w-[70%] mt-[4rem] items-center justify-center gap-4 m-auto px-5  text-gray-800 leading-relaxed space-y-6">
          <h4
            className={cn(
              "text-3xl md:text-4xl font-medium text-black",
              quicksand.className
            )}
          >
            Core <span className="text-[#F25C4C] font-semibold">Values</span>
          </h4>
  
          <div className="mt-8 space-y-10">
            {coreValues.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-center gap-6"
              >
                <div className="flex-shrink-0">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={100}
                    height={100}
                    className="h-[90px] w-[90px] md:h-[110px] md:w-[110px]"
                  />
                </div>
                <div className="flex flex-col gap-2 text-center md:text-left">
                  <h4 className="text-lg md:text-xl font-semibold">
                    {item.title}
                  </h4>
                  <p className="text-gray-700 text-sm md:text-base">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
  )
}

export default CoreValuesSection