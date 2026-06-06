import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import SessionLogsHistory from "./_session_logs/SessionLogsHistory";

function CrmAuditLogsPage() {
  return (
    <Workspace actionKey="audit_logs.crm.view">
    
      <div className="flex flex-col gap-5">
        <PageInfoBar
          title="Authentication Activity Logs"
          description="Login history and session termination tracking with browser and device information"
          showBack
        />
        <SessionLogsHistory />
      </div>
    </Workspace>
  );
}

export default CrmAuditLogsPage;
