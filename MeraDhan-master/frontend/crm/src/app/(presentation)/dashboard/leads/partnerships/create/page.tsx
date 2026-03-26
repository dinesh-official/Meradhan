import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import NewPartnershipView from "./NewPartnershipView";

function CreateNewPartnership() {
  return (
    <AllowOnlyView permissions={["create:leads"]}>
      <Workspace>
        <PageInfoBar
          title="Create New Partnership"
          description="Add details to create a new partnership submission."
          showBack
        />
        <NewPartnershipView />
      </Workspace>
    </AllowOnlyView>
  );
}

export default CreateNewPartnership;

