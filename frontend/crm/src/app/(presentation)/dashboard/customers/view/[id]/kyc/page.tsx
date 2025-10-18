import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import CustomerKycView from "./CustomerKycView";

export const revalidate = 0;
async function KycPage({ params }: { params: Promise<{ id: number }> }) {
  const { id } = await params;
  return (
    <Workspace>
      <CustomerKycView id={id} />
    </Workspace>
  );
}

export default KycPage;
