import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AuthenticationActivityLogsView from "./CrmAuthenticationLogsView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

function CrmAuditLogsPage() {
  return (
    <Workspace>
      <div className="flex flex-col gap-5">
        <PageInfoBar
          title="Authentication Activity Logs"
          description="Login history and session termination tracking with browser and device information"
          showBack
        />
        <AuthenticationActivityLogsView />
      </div>
    </Workspace>
  );
}

export default CrmAuditLogsPage;
