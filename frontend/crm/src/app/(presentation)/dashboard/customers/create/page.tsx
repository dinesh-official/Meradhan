import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import React from "react";
import NewCustomerView from "./NewCustomerView";

function page() {
  return (
    <Workspace actionKey="customers.create">
    
      <PageInfoBar
        title="Create Customer Profile"
        description="Add customer details to build a new profile."
        showBack
      />
      <NewCustomerView />
    </Workspace>
  );
}

export default page;
