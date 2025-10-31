import React from "react";
import PrivacyPolicy from "./PrivacyPolicy";
import ViewPort from "@/global/components/wrapper/ViewPort";
import slugBasedPagesGQLData, { slugBasedGQLMetaData } from "@/graphql/PagesGQLAction";
import { redirect } from "next/navigation";

export const revalidate = 0;
export async function generateMetadata() {
  return await slugBasedGQLMetaData("privacy-policy");
}
const page = async () => {
  const data = await slugBasedPagesGQLData("privacy-policy");
  if (!data) {
    redirect("/404");
  }
  console.log("data", data);
  return (
    <ViewPort>
      <PrivacyPolicy
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
