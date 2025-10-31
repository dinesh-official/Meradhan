import React from "react";
import CookiePolicy from "./CookiePolicy";
import ViewPort from "@/global/components/wrapper/ViewPort";
import slugBasedPagesGQLData from "@/graphql/PagesGQLAction";
import { redirect } from "next/navigation";

const page = async () => {
  const data = await slugBasedPagesGQLData("cookie-policy");
  if (!data) {
    redirect("/404");
  }
  return (
    <ViewPort>
      <CookiePolicy
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
