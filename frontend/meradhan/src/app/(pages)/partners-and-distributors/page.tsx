import React from "react";
import PartnersDistributors from "./PartnersDistributors";
import ViewPort from "@/global/components/wrapper/ViewPort";
import slugBasedPagesGQLData, {
  slugBasedGQLMetaData,
} from "@/graphql/pagesGQLAction";
import { redirect } from "next/navigation";

export const revalidate = 0;

export async function generateMetadata() {
  return await slugBasedGQLMetaData("partners-and-distributors");
}

const page = async () => {
  const data = await slugBasedPagesGQLData("partners-and-distributors");
  if (!data) {
    redirect("/404");
  }
  return (
    <ViewPort>
      <PartnersDistributors
        Description={data.Description}
        Content={data.Content}
        Slug={data.Slug}
        Title={data.Title}
        documentId={data.documentId}
      />
    </ViewPort>
  );
};

export default page;
