import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import UpdateCustomerView from "./UpdateCustomer.View";

function page() {
  return (
    <Workspace>
      <PageInfoBar
        title="Update Customer Profile"
        description="Update Customer Latest Information"
        showBack
      />
      <UpdateCustomerView />
    </Workspace>
  );
}

export default page;
