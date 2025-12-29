import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";
import { T_PAGE_DATA } from "@/graphql/pagesGQLAction";

const AboutUs = ({ Description, Title, Content }: T_PAGE_DATA) => {
  return (
    <>
      <TopTitleDesc title={Title} description={Description} />

      <div>
        {/* <AboutMeraDhanSection />
        <MissionVisionSection />
        <CoreValuesSection />
        <OfferingsSection />
        <OurExports />
        <WhyChooseUsSection /> */}
        <div
          dangerouslySetInnerHTML={{ __html: sanitizeStrapiHTML(Content) }}
        />
      </div>
    </>
  );
};

export default AboutUs;
