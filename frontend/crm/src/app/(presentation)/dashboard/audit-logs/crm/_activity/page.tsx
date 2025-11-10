import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import React from "react";
// import CrmActivityLogsView from "./CrmActivityLogsView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

function CrmAuditLogsPage() {
  return (
    <Workspace>
      <div className="flex flex-col gap-5">
        <PageInfoBar
          title="Audit Logs"
          description="Track all system activities and user sessions"
          showBack
        />
        {/* <CrmActivityLogsView /> */}
      </div>
    </Workspace>
  );
}

export default CrmAuditLogsPage;
