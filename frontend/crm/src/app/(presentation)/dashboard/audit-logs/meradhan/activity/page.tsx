import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import MeradhanActivityLogsView from "./MeradhanActivityLogsView";

function Page() {
  return (
    <Workspace actionKey="audit_logs.web.view">
      <MeradhanActivityLogsView />
    </Workspace>
  );
}

export default Page;
