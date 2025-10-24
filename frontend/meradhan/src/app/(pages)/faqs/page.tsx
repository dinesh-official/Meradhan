import ViewPort from "@/global/components/wrapper/ViewPort";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const faqs = [
    {
      q: "What is MeraDhan?",
      a: "MeraDhan is a platform where you can learn about bonds and fixed income investments. You can also buy and sell bonds easily.",
    },
    {
      q: "What is a bond?",
      a: "A bond is a fixed-income instrument that represents a loan made by an investor to a borrower (typically corporate or governmental).",
    },
    {
      q: "How is a bond different from a fixed deposit (FD)?",
      a: "Unlike FDs, bonds can be traded before maturity and may offer better returns, but they also carry market and credit risk.",
    },
    {
      q: "Are bonds safe to invest in?",
      a: "Bonds are generally safer than equities, but the safety depends on the issuer’s creditworthiness and the bond’s rating.",
    },
    {
      q: "What is MeraDhan?",
      a: "MeraDhan is a platform where you can learn about bonds and fixed income investments. You can also buy and sell bonds easily.",
    },
    {
      q: "What is a bond?",
      a: "A bond is a fixed-income instrument that represents a loan made by an investor to a borrower (typically corporate or governmental).",
    },
    {
      q: "How is a bond different from a fixed deposit (FD)?",
      a: "Unlike FDs, bonds can be traded before maturity and may offer better returns, but they also carry market and credit risk.",
    },
    {
      q: "Are bonds safe to invest in?",
      a: "Bonds are generally safer than equities, but the safety depends on the issuer’s creditworthiness and the bond’s rating.",
    },
  ];

  return (
    <ViewPort>
      {/* Hero Section */}
      <div className="bg-primary h-72">
        <div className="flex flex-col gap-6 items-center justify-center h-full container">
          <h1
            className={cn(
              "md:text-4xl text-3xl text-center text-white font-medium",
              quicksand.className
            )}
          >
            Frequently Asked{" "}
            <span className="font-semibold text-secondary">Questions</span>
          </h1>
          <p className="text-white max-w-[800px] text-center">
            Find clear answers to commonly asked questions about MeraDhan, bond
            investing, and our platform’s features to help you make informed
            financial decisions.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12">
        <div className="container max-w-3xl">
          <Accordion type="single" collapsible defaultValue="item-0">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b-0">
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </ViewPort>
  );
}
