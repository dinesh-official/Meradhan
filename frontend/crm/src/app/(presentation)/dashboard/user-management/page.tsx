import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import React from "react";
import UsersManagementView from "./UsersManagementView";

function UsersManagementPage() {
  return (
    <AllowOnlyView permissions={["view:user"]}>
    <Workspace>
      <UsersManagementView />
    </Workspace>
    </AllowOnlyView>
  );
}

export default UsersManagementPage;
