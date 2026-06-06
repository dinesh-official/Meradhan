import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import UpdateRfqForm from "./_forms/UpdateRfqForm";

function page() {
  return (
    <Workspace actionKey="rfqs.manage">
      
        <UpdateRfqForm />
      </Workspace>
  );
}

export default page;
