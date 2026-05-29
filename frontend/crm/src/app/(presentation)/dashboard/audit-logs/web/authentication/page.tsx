import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import type { Metadata } from "next";
import AuthenticationActivityLogsView from "./CrmAuthenticationLogsView";

export const metadata: Metadata = {
  title: "Authentication Activity Logs | MeraDhan",
  description: "Login history and session termination tracking.",
};

function CrmAuditLogsPage() {
  return (
    <Workspace actionKey="audit_logs.web.view">
    
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
