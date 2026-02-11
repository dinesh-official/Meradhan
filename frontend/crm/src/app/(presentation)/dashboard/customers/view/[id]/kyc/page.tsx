import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import CustomerKycView from "./CustomerKycView";
import { decodeId } from "@/global/utils/url.utils";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";

export const revalidate = 0;
async function KycPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);
  return (
    <AllowOnlyView permissions={["view:customerkyc"]}>
      <Workspace>
        <CustomerKycView id={id} />
      </Workspace>
    </AllowOnlyView>
  );
}

export default KycPage;
