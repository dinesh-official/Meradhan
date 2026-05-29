import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import CustomerListNotificationsView from "./CustomerListNotificationsView";

function Page() {
  return (
    <Workspace actionKey="notifications.customer_list.view">
      
        <CustomerListNotificationsView />
      </Workspace>
  );
}

export default Page;
