import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import NSEDealsView from "./NSEDealsView";

function DealsPage() {
  return (
    <Workspace>
      <PageInfoBar
        title="NSE Deals"
        description="Manage NSE deal submissions and confirmations"
      />
      <NSEDealsView />
    </Workspace>
  );
}

export default DealsPage;
