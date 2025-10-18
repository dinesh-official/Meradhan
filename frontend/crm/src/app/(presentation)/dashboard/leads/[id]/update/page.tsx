import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import UpdateLeadView from "./UpdateLeadView";

export const revalidate = 0;

async function page({ params }: { params: Promise<{ id: number }> }) {
  const { id } = await params;
  return (
    <Workspace>
      <PageInfoBar
        title="Update Leads Information"
        description="update leads Information"
        showBack
      />
      <UpdateLeadView id={id} />
    </Workspace>
  );
}

export default page;
