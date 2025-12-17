import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import { T_PAGE_DATA } from "@/graphql/pagesGQLAction";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";

const AboutUs = ({ Description, Title, Content }: T_PAGE_DATA) => {
  return (
    <>
      <TopTitleDesc title={Title} description={Description} />

      <div>
        {/* <AboutMeraDhanSection />
        <MissionVisionSection />
        <CoreValuesSection />
        <OfferingsSection />
        <WhyChooseUsSection /> */}
        <div dangerouslySetInnerHTML={{ __html: sanitizeStrapiHTML(Content) }} />
      </div>
    </>
  );
};

export default AboutUs;
