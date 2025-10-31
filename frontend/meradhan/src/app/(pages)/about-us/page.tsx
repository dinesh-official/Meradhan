import React from "react";
import AboutUs from "./AboutUs";
import ViewPort from "@/global/components/wrapper/ViewPort";
import slugBasedPagesGQLData from "@/graphql/PagesGQLAction";
import { redirect } from "next/navigation";

export const revalidate = 0;
const page = async () => {
  const data = await slugBasedPagesGQLData("about-us");
  if (!data) {
    redirect("/404");
  }
  return (
    <ViewPort>
      <AboutUs
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
