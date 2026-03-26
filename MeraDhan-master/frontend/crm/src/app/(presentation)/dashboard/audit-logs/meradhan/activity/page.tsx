import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import MeradhanActivityLogsView from "./MeradhanActivityLogsView";

function Page() {
  return (
    <AllowOnlyView permissions={["view:webauditlogs"]}>
      <MeradhanActivityLogsView />
    </AllowOnlyView>
  );
}

export default Page;
