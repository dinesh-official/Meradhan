import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import React from "react";
import PgManagementView from "../_components/PgManagementView";

function Page() {
  return (
    <AllowOnlyView permissions={["view:orders"]}>
      <Workspace>
        <PgManagementView />
      </Workspace>
    </AllowOnlyView>
  );
}

export default Page;
