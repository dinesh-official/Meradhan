import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import SettleOrdersView from "./SettleOrdersView";

function page() {
  return (
    <Workspace>
      <PageInfoBar title="Settle Orders" />
      <SettleOrdersView />
    </Workspace>
  );
}

export default page;
