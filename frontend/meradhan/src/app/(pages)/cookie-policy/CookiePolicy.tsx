import React from "react";
import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import { T_PAGE_DATA } from "@/graphql/PagesGQLAction";

const CookiePolicy = ({ Description, Title, Content }: T_PAGE_DATA) => {
  return (
    <>
      <TopTitleDesc title={Title} description={Description} />

      <div dangerouslySetInnerHTML={{ __html: Content }} />
      {/* <CookieContent /> */}
    </>
  );
};

export default CookiePolicy;
