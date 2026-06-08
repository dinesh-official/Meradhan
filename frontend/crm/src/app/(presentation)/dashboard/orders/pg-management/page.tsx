import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import PgManagementView from "../_components/PgManagementView";

function Page() {
  return (
    <Workspace actionKey="orders.edit">
      
        <PgManagementView />
      </Workspace>
  );
}

export default Page;
