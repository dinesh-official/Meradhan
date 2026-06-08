import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import SessionLogsHistory from "./_session_logs/SessionLogsHistory";

function CrmAuditLogsPage() {
  return (
    <AllowOnlyView permissions={["view:crmauditlogs"]}>
    <Workspace>
      <div className="flex flex-col gap-5">
        <PageInfoBar
          title="Authentication Activity Logs"
          description="Login history and session termination tracking with browser and device information"
          showBack
        />
        <SessionLogsHistory />
      </div>
    </Workspace>
    </AllowOnlyView>
  );
}

export default CrmAuditLogsPage;
