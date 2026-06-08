import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import React from "react";
import CrmOrdersView from "./CrmOrdersView";

function page() {
  return (
    <AllowOnlyView permissions={["view:orders"]}>
    <Workspace>
      <CrmOrdersView />
    </Workspace>
    </AllowOnlyView>
  );
}

export default page;
