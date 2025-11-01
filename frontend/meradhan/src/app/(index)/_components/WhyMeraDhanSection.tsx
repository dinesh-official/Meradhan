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
    title: "AI-Powered Learning Support",
    content: (
      <>
        <p>
          Powered by intelligent search, DhanGPT answers your questions about
          bonds—whether it’s “What is a government bond?” or “How does interest
          work in fixed income?”
        </p>
        <p className="mt-2">
          No jargon. Just clear, contextual learning in seconds.
        </p>
      </>
    ),
  },
  {
    title: "Expert-Led Learning",
    content: (
      <>
        <p>
          MeraDhan is founded by professionals with rich backgrounds in
          financial markets, risk management, and digital transformation.
        </p>
        <p className="mt-2">
          Our content is crafted and reviewed by experts to ensure accuracy,
          simplicity, and real-world relevance for Indian audiences.
        </p>
      </>
    ),
  },
  {
    title: "Retail Learning, Made Simple",
    content: (
      <>
        <p>
          We focus on individual learners—first-time investors, working
          professionals, senior citizens, and students—by offering
          plain-language explainers, tools, and infographics to help you
          understand bonds confidently and independently.
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
          description=" MeraDhan is built on decades of financial expertise, drawing from
          experience in global institutions. We blend deep market knowledge with
          data-driven insights to bring accessible, unbiased, and
          easy-to-understand fixed income knowledge sharing with every Indian."
        />

        <div className="bg-muted my-4 px-8 lg:px-0 py-6 rounded-lg">
          <div className="grid lg:grid-cols-4 text-center">
            <WhyPoints>
              <FaSackDollar size={25} className="text-primary" />
              <span className="flex justify-center items-center mt-2 font-medium text-xl">
                <PiCurrencyInrBold /> 10,000
              </span>
              <p className="text-sm">Minimum Investment</p>
            </WhyPoints>
            <WhyPoints>
              <FaUser size={25} className="text-primary" />
              <span className="flex justify-center items-center mt-2 font-medium text-xl">
                7,600+
              </span>
              <p className="text-sm">Users</p>
            </WhyPoints>
            <WhyPoints>
              <FaFileWaveform size={25} className="text-primary" />
              <span className="flex justify-center items-center mt-2 font-medium text-xl">
                6200+
              </span>
              <p className="text-sm">Bonds</p>
            </WhyPoints>
            <WhyPoints isLast>
              <FaMoneyBill size={25} className="text-primary" />
              <span className="flex justify-center items-center mt-2 font-medium text-xl">
                0
              </span>
              <p className="text-sm">Brokerage Fee</p>
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
