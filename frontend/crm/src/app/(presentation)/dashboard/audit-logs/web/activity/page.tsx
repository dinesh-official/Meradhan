import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity Logs | MeraDhan",
  description: "Comprehensive tracking of user actions and system events.",
};

function CrmAAcitivityuditLogsPage() {
  return (
    <Workspace>
      <div className="flex flex-col gap-5">
        <PageInfoBar
          title="Activity Logs"
          description="Comprehensive tracking of user actions and system events within the CRM"
          showBack
        />
        {/* <AuthenticationActivityLogsView /> */}
      </div>
    </Workspace>
  );
}

export default CrmAAcitivityuditLogsPage;
