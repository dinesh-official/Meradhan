import React from "react";
import ViewPort from "@/global/components/wrapper/ViewPort";
import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import { T_PAGE_DATA } from "@/graphql/pagesGQLAction";

const TermsOfUse = ({ Description, Title, Content }: T_PAGE_DATA) => {
  console.log(Content);
  return (
    <ViewPort>
      <TopTitleDesc title={Title} description={Description} />

      {/* <TermsContent /> */}
      <div dangerouslySetInnerHTML={{ __html: Content }} />
    </ViewPort>
  );
};

export default TermsOfUse;
