import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import React from "react";
import LeadsView from "./LeadsView";

function LeadsPage() {
  return (
    <AllowOnlyView permissions={["view:leads"]}>
    <Workspace>
      <LeadsView />
    </Workspace>
    </AllowOnlyView>
  );
}

export default LeadsPage;
