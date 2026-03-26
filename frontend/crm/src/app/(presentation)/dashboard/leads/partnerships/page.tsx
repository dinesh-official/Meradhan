import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import React from "react";
import PartnershipsView from "./PartnershipsView";

function PartnershipsPage() {
  return (
    <AllowOnlyView permissions={["view:leads"]}>
      <Workspace>
        <PartnershipsView />
      </Workspace>
    </AllowOnlyView>
  );
}

export default PartnershipsPage;

