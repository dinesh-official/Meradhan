import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import CrmActivityLogsView from "./CrmActivityLogsView";

function CrmAAcitivityuditLogsPage() {
  return (
    <Workspace>
      <div className="flex flex-col gap-5">
        <PageInfoBar
          title="Activity Logs"
          description="Comprehensive tracking of user actions and system events within the CRM"
          showBack
        />
        <CrmActivityLogsView />
      </div>
    </Workspace>
  );
}

export default CrmAAcitivityuditLogsPage;
