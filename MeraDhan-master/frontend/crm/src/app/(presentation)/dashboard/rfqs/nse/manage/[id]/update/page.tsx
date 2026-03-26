import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import React from "react";
import UpdateRfqForm from "./_forms/UpdateRfqForm";

function page() {
  return (
    <AllowOnlyView permissions={["edit:rfq"]}>
      <Workspace>
        <UpdateRfqForm />
      </Workspace>
    </AllowOnlyView>
  );
}

export default page;
