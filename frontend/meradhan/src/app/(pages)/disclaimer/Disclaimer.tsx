import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import { T_PAGE_DATA } from "@/graphql/pagesGQLAction";

const Disclaimer = ({ Description, Title, Content }: T_PAGE_DATA) => {
  return (
    <div>
      <TopTitleDesc title={Title} description={Description} />
      {/* <DisclaimerContent /> */}
      <div className="container article ">
        <div dangerouslySetInnerHTML={{ __html: Content }} className="py-20" />
      </div>
    </div>
  );
};

export default Disclaimer;
