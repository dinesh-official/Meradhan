import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import PartnershipDetailsView from "./PartnershipDetailsView";
import { decodeId } from "@/global/utils/url.utils";

export const revalidate = 0;

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);
  return (
    <AllowOnlyView permissions={["view:leads"]}>
      <Workspace>
        <PageInfoBar
          title="Partnership Details"
          description="View partnership submission details"
          showBack
        />
        <PartnershipDetailsView id={id} />
      </Workspace>
    </AllowOnlyView>
  );
}

export default page;

