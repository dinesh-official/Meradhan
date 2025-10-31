import React from "react";
import TermsOfUse from "./TermsOfUse";
import slugBasedPagesGQLData from "@/graphql/PagesGQLAction";
import { redirect } from "next/navigation";
export const revalidate = 0;
const page = async () => {
  const data = await slugBasedPagesGQLData("terms-of-use");
  if (!data) {
    redirect("/404");
  }
  console.log("data", data);
  return (
    <TermsOfUse
      Content={data.Content}
      Description={data.Description}
      Slug={data.Slug}
      Title={data.Title}
      documentId={data.documentId}
    />
  );
};

export default page;
