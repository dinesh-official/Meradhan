import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import CustomerKycView from "./CustomerKycView";
import { decodeId } from "@/global/utils/url.utils";

export const revalidate = 0;
async function KycPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);
  return (
    <Workspace>
      <CustomerKycView id={id} />
    </Workspace>
  );
}

export default KycPage;
