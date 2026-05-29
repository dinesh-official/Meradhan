import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import NscRfqView from "./NscRfqView";

function page() {
  return (
    <Workspace actionKey="rfqs.view">
      
        <NscRfqView />
      </Workspace>
  );
}

export default page;
