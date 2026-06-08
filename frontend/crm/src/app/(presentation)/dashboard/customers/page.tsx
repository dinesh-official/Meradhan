import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import CustomersView from "./CustomersView";

function page() {
  return (
    <Workspace actionKey="customers.view">
    
      <CustomersView />
    </Workspace>
  );
}

export default page;
