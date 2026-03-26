import React from "react";
import Disclaimer from "./Disclaimer";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { redirect } from "next/navigation";
import slugBasedPagesGQLData, { slugBasedGQLMetaData } from "@/graphql/pagesGQLAction";
export const revalidate = 0;
export async function generateMetadata() {
  return await slugBasedGQLMetaData("disclaimer");
}

const page = async () => {
  const data = await slugBasedPagesGQLData("disclaimer");
  if (!data) {
    redirect("/404");
  }

  return (
    <ViewPort>
      <Disclaimer
        Content={data.Content}
        Description={data.Description}
        Slug={data.Slug}
        Title={data.Title}
        documentId={data.documentId}
      />
    </ViewPort>
  );
};

export default page;
