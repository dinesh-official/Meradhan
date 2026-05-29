import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import LeadsView from "./LeadsView";

function LeadsPage() {
  return (
    <Workspace actionKey="leads.view">
    
      <LeadsView />
    </Workspace>
  );
}

export default LeadsPage;
