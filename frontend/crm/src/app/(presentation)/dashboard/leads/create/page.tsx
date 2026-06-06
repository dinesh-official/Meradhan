import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import NewLeadView from "./NewLeadView";

function CreateNewLead() {
  return (
    <Workspace actionKey="leads.create">
    
      <PageInfoBar
        title="Create New Lead"
        description="Add details to build a new lead."
        showBack
      />
      <NewLeadView />
    </Workspace>
  );
}

export default CreateNewLead;
