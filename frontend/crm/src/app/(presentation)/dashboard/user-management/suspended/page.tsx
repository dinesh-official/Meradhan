import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import SuspendedUserView from "./SuspendedUserView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

function page() {
  return (
    <Workspace>
      <PageInfoBar
        title="Suspended User"
        description="manage all suspended users"
      />
      <SuspendedUserView />
    </Workspace>
  );
}

export default page;
