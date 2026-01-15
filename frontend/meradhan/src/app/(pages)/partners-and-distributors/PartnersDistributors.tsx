import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";
import { T_PAGE_DATA } from "@/graphql/pagesGQLAction";
import PartnershipForm from "./_components/PartnershipForm";
import PartnershipOpportunitiesSection from "./_components/sections/PartnershipOpportunitiesSection";
import WhyPartnerSection from "./_components/sections/WhyPartnerSection";

const PartnersDistributors = ({ Description, Title, Content }: T_PAGE_DATA) => {
  return (
    <>
      <TopTitleDesc title={Title} description={Description} />

      <div className="container mt-[4rem] mb-[4rem]">
        <div>
          <div
            className="mb-8 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: sanitizeStrapiHTML(Content) }}
          />

          <WhyPartnerSection />
          <PartnershipOpportunitiesSection />
        </div>
        <PartnershipForm />
      </div>
    </>
  );
};

export default PartnersDistributors;
