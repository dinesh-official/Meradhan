import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AuthenticationActivityLogsView from "./CrmActivityLogsView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

function CrmAAcitivityuditLogsPage() {
  return (
    <Workspace>
      <div className="flex flex-col gap-5">
        <PageInfoBar
          title="Activity Logs"
          description="Comprehensive tracking of user actions and system events within the CRM"
          showBack
        />
        <AuthenticationActivityLogsView />
      </div>
    </Workspace>
  );
}

export default CrmAAcitivityuditLogsPage;
