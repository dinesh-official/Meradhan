import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import CrmOrdersView from "./CrmOrdersView";

function page() {
  return (
    <Workspace actionKey="orders.view">
    
      <CrmOrdersView />
    </Workspace>
  );
}

export default page;
