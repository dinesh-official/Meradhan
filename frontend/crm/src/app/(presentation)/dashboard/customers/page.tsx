import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import React from "react";
import CustomersView from "./CustomersView";

function page() {
  return (
    <AllowOnlyView permissions={["view:customer"]}>
    <Workspace>
      <CustomersView />
    </Workspace>
    </AllowOnlyView>
  );
}

export default page;
