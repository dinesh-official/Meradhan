import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import NewPartnershipView from "./NewPartnershipView";

function CreateNewPartnership() {
  return (
    <Workspace actionKey="leads.create">
      
        <PageInfoBar
          title="Create New Partnership"
          description="Add details to create a new partnership submission."
          showBack
        />
        <NewPartnershipView />
      </Workspace>
  );
}

export default CreateNewPartnership;

