import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import PartnershipsView from "./PartnershipsView";

function PartnershipsPage() {
  return (
    <Workspace actionKey="leads.view">
      
        <PartnershipsView />
      </Workspace>
  );
}

export default PartnershipsPage;

