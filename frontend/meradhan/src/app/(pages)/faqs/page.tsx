import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { fetchFaqData } from "./_gql/faq.gql";

export const revalidate = 0;

export default async function FAQPage() {
  const faqs = await fetchFaqData();

  return (
    <ViewPort>
      <TopTitleDesc
        title={
          /*html*/ `Frequently Asked <span class="font-semibold text-secondary"> Questions</span>`
        }
        description="Find clear answers to commonly asked questions about MeraDhan, bond investing, and our
platform’s features to help you make informed financial decisions."
      ></TopTitleDesc>

      <div className="py-12">
        <div className="max-w-3xl container">
          <Accordion type="single" collapsible defaultValue="item-0">
            {faqs?.faqS_connection.nodes.map((faq, i) => (
              <AccordionItem
                key={faq.documentId}
                value={`item-${i}`}
                className="border-b-0"
              >
                <AccordionTrigger className="quicksand-semibold">
                  {faq.Question}
                </AccordionTrigger>
                <AccordionContent>{faq.Answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </ViewPort>
  );
}
