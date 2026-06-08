import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import UpdatePartnershipView from "./UpdatePartnershipView";
import { decodeId } from "@/global/utils/url.utils";

export const revalidate = 0;

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);
  return (
    <Workspace actionKey="leads.edit">
      
        <PageInfoBar
          title="Update Partnership Information"
          description="Update partnership submission details"
          showBack
        />
        <UpdatePartnershipView id={id} />
      </Workspace>
  );
}

export default page;

