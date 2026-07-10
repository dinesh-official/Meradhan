import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { fetchFaqData } from "./_gql/faq.gql";
import {
  getDynamicPageDataGql,
  getDynamicPageMetaDataGql,
} from "@/graphql/getDynamicPageDataGql";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";

export const revalidate = 0;

export async function generateMetadata() {
  return await getDynamicPageMetaDataGql("faqs");
}

export default async function FAQPage() {
  const data = await getDynamicPageDataGql("faqs");
  const faqs = await fetchFaqData();

  return (
    <ViewPort>
      <TopTitleDesc
        title={data?.Title || "Frequently Asked Questions (FAQs)"}
        description={
          data?.Content.Introduction ||
          "Find answers to common questions about our platform, services, and more."
        }
      ></TopTitleDesc>

      <SectionWrapper>
        <div className="container">
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
      </SectionWrapper>
    </ViewPort>
  );
}
