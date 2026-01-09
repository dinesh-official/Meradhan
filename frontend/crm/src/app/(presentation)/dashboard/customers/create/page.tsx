import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import NewCustomerView from "./NewCustomerView";

function page() {
  return (
    <AllowOnlyView permissions={["create:customer"]}>
    <Workspace>
      <PageInfoBar
        title="Create Customer Profile"
        description="Add customer details to build a new profile."
        showBack
      />
      <NewCustomerView />
    </Workspace>
    </AllowOnlyView>
  );
}

export default page;
