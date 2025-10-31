import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import { T_PAGE_DATA } from "@/graphql/PagesGQLAction";

const PrivacyPolicy = ({ Description, Title, Content }: T_PAGE_DATA) => {
  return (
    <>
      <TopTitleDesc title={Title} description={Description} />
      {/* <PrivacyPolicyContent /> */}
      <div dangerouslySetInnerHTML={{ __html: Content }} />
    </>
  );
};

export default PrivacyPolicy;
