import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import React from "react";
import NscRfqView from "./NscRfqView";

function page() {
  return (
    <AllowOnlyView permissions={["view:rfq"]}>
      <Workspace>
        <NscRfqView />
      </Workspace>
    </AllowOnlyView>
  );
}

export default page;
