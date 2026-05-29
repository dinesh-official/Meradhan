import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import SettlementDatesView from "./SettlementDatesView";

function page() {
  return (
    <Workspace actionKeys={[
        "rfqs.settlement_dates.view",
        "rfqs.settlement_dates.edit",
      ]}>
      
        <PageInfoBar title="NSE Settlement Dates" />
        <SettlementDatesView />
      </Workspace>
  );
}

export default page;
