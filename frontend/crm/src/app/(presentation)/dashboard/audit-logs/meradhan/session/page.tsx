import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import MeradhanSessionLogsView from "./MeradhanSessionLogsView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

function Page() {
  return (
    <AllowOnlyView permissions={["view:webauditlogs"]}>
    <Workspace>
      <PageInfoBar
        title="Meradhan Session Logs"
        description="Detailed records of user sessions including IP addresses, browsers, and device types"
        showBack
      />
      <br />
      <MeradhanSessionLogsView />
    </Workspace>
    </AllowOnlyView>
  );
}

export default Page;
