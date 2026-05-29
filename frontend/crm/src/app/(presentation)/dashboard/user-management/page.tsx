import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import UsersManagementView from "./UsersManagementView";

function UsersManagementPage() {
  return (
    <Workspace actionKey="user_management.view">
    
      <UsersManagementView />
    </Workspace>
  );
}

export default UsersManagementPage;
