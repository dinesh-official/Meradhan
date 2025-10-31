import ViewPort from "@/global/components/wrapper/ViewPort";
 import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fetchFaqData } from "./_gql/faq.gql";

export const revalidate = 0;

export default async function FAQPage() {
  const faqs = await fetchFaqData();

  return (
    <ViewPort>
      <div className="bg-primary h-72">
        <div className="flex flex-col justify-center items-center gap-6 h-full container">
          <h1
            className={cn(
              "font-medium text-white text-3xl md:text-4xl text-center",
              "quicksand-medium"
            )}
          >
            Frequently Asked{" "}
            <span className="font-semibold text-secondary">Questions</span>
          </h1>
          <p className="max-w-[800px] text-white text-center">
            Find clear answers to commonly asked questions about MeraDhan, bond
            investing, and our platform’s features to help you make informed
            financial decisions.
          </p>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-3xl container">
          <Accordion type="single" collapsible defaultValue="item-0">
            {faqs?.faqS_connection.nodes.map((faq, i) => (
              <AccordionItem
                key={faq.documentId}
                value={`item-${i}`}
                className="border-b-0"
              >
                <AccordionTrigger>{faq.Question}</AccordionTrigger>
                <AccordionContent>{faq.Answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </ViewPort>
  );
}
