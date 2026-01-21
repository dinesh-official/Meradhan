import { Card, CardContent } from "@/components/ui/card";
import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import { cn } from "@/lib/utils";
import React from "react";
import {
  FaFileWaveform,
  FaMoneyBill,
  FaSackDollar,
  FaUser,
} from "react-icons/fa6";
import { PiCurrencyInrBold } from "react-icons/pi";
function WhyPoints({
  children,
  isLast,
}: {
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-1 py-4 border-primary/10 lg:border-r-2 border-b-2 lg:border-b-0 text-center",
        isLast && "border-none"
      )}
    >
      {children}
    </div>
  );
}

const whyCardInfo = [
  {
    title: "AI-Powered Insights",
    content: (
      <>
        <p>
          MeraDhan stands out with its intelligent AI-driven search engine, providing personalised bond recommendations and answering all user queries—from investment options to buying/selling guidance—making bond investing effortless and informed.
        </p>
      </>
    ),
  },
  {
    title: "Expert-Led Platform",
    content: (
      <>
        <p>
          Founded by a seasoned leader with extensive experience in major financial institutions and digital transformation, MeraDhan brings unparalleled expertise in risk management, financial markets, and bond investments, providing users with top-tier strategic insight and support.
        </p>
      </>
    ),
  },
  {
    title: "Retail Investor Focus",
    content: (
      <>
        <p>
          MeraDhan focuses on empowering retail investors with intuitive tools, educational resources, and curated bond options, allowing individuals to confidently grow their wealth and navigate the bond market with ease.
        </p>
      </>
    ),
  },
];

function WhyMeraDhanSection() {
  return (
    <SectionWrapper>
      <div className="flex flex-col gap-5 container">
        <SectionTitleDesc
          title={
            <>
              Why <span className="font-semibold text-secondary">MeraDhan</span>
            </>
          }
          description="MeraDhan is built on decades of expertise in global financial institutions, leveraging deep industry knowledge to drive financial innovation. With a strong foundation in data-driven transformations, risk management strategies, and digital advancements, MeraDhan is committed to empowering users with smarter financial solutions. "
        />

        <div className="bg-muted my-4 px-8 lg:px-0 py-6 rounded-lg">
          <div className="grid lg:grid-cols-4 text-center">
            <WhyPoints>
              <FaSackDollar size={25} className="text-primary" />
              <span className="flex justify-center items-center mt-2 text-2xl">
                <PiCurrencyInrBold /> 10,000
              </span>
              <p>Minimum Investment</p>
            </WhyPoints>
            <WhyPoints>
              <FaUser size={25} className="text-primary" />
              <span className="flex justify-center items-center mt-2 text-2xl">
                7,600+
              </span>
              <p>Users</p>
            </WhyPoints>
            <WhyPoints>
              <FaFileWaveform size={25} className="text-primary" />
              <span className="flex justify-center items-center mt-2 text-2xl">
                6200+
              </span>
              <p>Bonds</p>
            </WhyPoints>
            <WhyPoints isLast>
              <FaMoneyBill size={25} className="text-primary" />
              <span className="flex justify-center items-center mt-2 text-2xl">
                0
              </span>
              <p>Brokerage Fee</p>
            </WhyPoints>
          </div>
        </div>

        <div className="gap-5 grid lg:grid-cols-3">
          {whyCardInfo.map((item, i) => (
            <Card key={i}>
              <CardContent className="py-0">
                <h5 className="mb-3 font-medium text-xl">{item.title}</h5>
                <div>{item.content}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

export default WhyMeraDhanSection;
