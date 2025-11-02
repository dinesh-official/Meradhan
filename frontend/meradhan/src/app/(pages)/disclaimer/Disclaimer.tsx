import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import { T_PAGE_DATA } from "@/graphql/pagesGQLAction";

const Disclaimer = ({ Description, Title, Content }: T_PAGE_DATA) => {
  return (
    <div>
      <TopTitleDesc title={Title} description={Description} />
      {/* <DisclaimerContent /> */}
      <div dangerouslySetInnerHTML={{ __html: Content }} />
    </div>
  );
};

export default Disclaimer;
