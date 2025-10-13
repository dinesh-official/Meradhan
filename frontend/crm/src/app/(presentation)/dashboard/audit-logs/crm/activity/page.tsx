import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
import CrmActivityLogsView from "./CrmActivityLogsView";

function CrmAuditLogsPage() {
  return (
    <Workspace>
      <CrmActivityLogsView />
    </Workspace>
  );
}

export default CrmAuditLogsPage;
