import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import CustomerProfileView from "./CustomerProfileView";

async function page({ params }: { params: Promise<{ id: number }> }) {
  const { id } = await params;
  console.log("id", id);

  return (
    <Workspace>
      <CustomerProfileView profileId = {id}/>
    </Workspace>
  );
}

export default page;
