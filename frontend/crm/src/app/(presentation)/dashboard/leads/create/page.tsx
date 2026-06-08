import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import NewLeadView from "./NewLeadView";

function CreateNewLead() {
  return (
    <AllowOnlyView permissions={["create:leads"]}>
    <Workspace>
      <PageInfoBar
        title="Create New Lead"
        description="Add details to build a new lead."
        showBack
      />
      <NewLeadView />
    </Workspace>
    </AllowOnlyView>
  );
}

export default CreateNewLead;
