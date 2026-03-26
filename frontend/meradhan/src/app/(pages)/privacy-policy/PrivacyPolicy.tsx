import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import { T_PAGE_DATA } from "@/graphql/pagesGQLAction";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";

const PrivacyPolicy = ({ Description, Title, Content }: T_PAGE_DATA) => {
  return (
    <>
      <TopTitleDesc title={Title} description={Description} />
      {/* <PrivacyPolicyContent /> */}
      <div className="container article ">
        <div dangerouslySetInnerHTML={{ __html: sanitizeStrapiHTML(Content) }} className="py-20" />
      </div>
    </>
  );
};

export default PrivacyPolicy;
