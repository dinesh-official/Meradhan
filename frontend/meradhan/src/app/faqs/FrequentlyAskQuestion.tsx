import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import BannerSubscribe from "@/global/elements/MarketUpdateBanner";
import { AccordionTrigger } from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import React from "react";

const faqs: { id: string; question: string; answer: React.ReactNode }[] = [
  {
    id: "what-is-meradhan",
    question: "What is MeraDhan?",
    answer:
      "MeraDhan is a platform where you can learn about bonds and fixed income investments. You can also buy and sell bonds easily.",
  },
  {
    id: "what-is-bond",
    question: "What is a bond?",
    answer:
      "A bond is a loan you give to a company or government. In return, they promise to pay you interest at regular intervals and repay the principal at maturity.",
  },
  {
    id: "bond-vs-fd",
    question: "How is a bond different from a fixed deposit (FD)?",
    answer:
      "FDs are deposits with banks with a fixed interest rate. Bonds are tradable securities issued by companies/governments that can vary in return and risk. Bonds can be sold before maturity; FDs generally cannot without penalties.",
  },
  {
    id: "safe-to-invest",
    question: "Are bonds safe to invest in?",
    answer:
      "Safety depends on the issuer's credit quality and the bond type. Highly rated bonds (AAA/AA) are considered safer than low-rated or unsecured bonds, but no investment is risk‑free.",
  },
  {
    id: "earn-money",
    question: "How do I earn money from bonds?",
    answer:
      "You earn via periodic interest (coupon) payments and potential capital gains if you sell the bond at a higher price than you bought it.",
  },
  {
    id: "minimum-amount",
    question: "What is the minimum amount needed to invest in bonds?",
    answer:
      "Minimums vary by bond and offering. On MeraDhan you may find lots starting from relatively small ticket sizes compared to traditional bonds.",
  },
  {
    id: "how-to-buy",
    question: "How do I buy bonds on MeraDhan?",
    answer:
      "Create an account, complete KYC, browse available bonds, review details (coupon, rating, yield, maturity), add to cart, and complete the purchase.",
  },
  {
    id: "issuer-bankrupt",
    question: "What happens if the company issuing the bond goes bankrupt?",
    answer:
      "Bondholders have priority over shareholders during liquidation, but recovery is not guaranteed and depends on the bond's security and seniority.",
  },
];

const FrequentlyAskQuestion = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Top banner */}
      <section className="relative w-full bg-[#0a3150] text-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h1 className="text-center text-3xl tracking-tight md:text-5xl">
            Frequently Asked <span className="text-[#ef4822]">Questions</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm/6 text-white/80 md:text-base">
            Find clear answers to commonly asked questions about MeraDhan, bond
            investing, and our platform’s features to help you make informed
            financial decisions.
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section className="mx-auto max-w-[70%] pt-15 pb-15">
        <Accordion type="single" collapsible className="">
          {faqs.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className=" border-0  hover:bg-gray-100 rounded-md transition-all duration-300 p-5"
            >
               <AccordionTrigger className="flex justify-between items-center text-left text-lg font-medium group gap-3">
                   <ChevronDown
                className="h-5 w-5 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180 text-gray-500"
                aria-hidden="true"
              />
              {item.question}
           
            </AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <BannerSubscribe
        title="Stay up-to-date with market updates!"
        subtitle="Subscribe to our newsletter!"
      />
    </div>
  );
};

export default FrequentlyAskQuestion;
