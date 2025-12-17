import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import OrderDetailsView from "./OrderDetailsView";

function page() {
  return (
    <Workspace>
      <OrderDetailsView />
    </Workspace>
  );
}

export default page;

