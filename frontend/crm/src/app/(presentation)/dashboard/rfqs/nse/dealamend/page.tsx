import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import DealAmendView from "./DealAmendView";

function page() {
  return (
    <Workspace actionKey="rfqs.deals.view">
      
        <DealAmendView />
      </Workspace>
  );
}

export default page;
