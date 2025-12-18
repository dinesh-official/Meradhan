import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import UpdateLeadView from "./UpdateLeadView";
import { decodeId } from "@/global/utils/url.utils";

export const revalidate = 0;

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);
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
