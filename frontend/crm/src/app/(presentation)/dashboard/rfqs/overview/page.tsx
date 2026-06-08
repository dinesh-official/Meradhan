import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import RfqOverviewView from "./RfqOverviewView";

function RfqOverview() {
  return (
    <AllowOnlyView permissions={["view:rfq"]}>
    <Workspace>
      <RfqOverviewView />
    </Workspace>
    </AllowOnlyView>
  );
}

export default RfqOverview;
