import React from "react";
import Disclaimer from "./Disclaimer";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { redirect } from "next/navigation";
import slugBasedPagesGQLData from "@/graphql/PagesGQLAction";

const page = async () => {
  const data = await slugBasedPagesGQLData("terms-of-use");
  if (!data) {
    redirect("/404");
  }
  console.log("data", data);
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
