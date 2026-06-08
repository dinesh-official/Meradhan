import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import type { Metadata } from "next";
import AuthenticationActivityLogsView from "./CrmActivityLogsView";

export const metadata: Metadata = {
  title: "Activity Logs | MeraDhan",
  description: "Comprehensive tracking of user actions and system events.",
};

function CrmAAcitivityuditLogsPage() {
  return (
    <AllowOnlyView permissions={["view:webauditlogs"]}>
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
    </AllowOnlyView>
  );
}

export default CrmAAcitivityuditLogsPage;
