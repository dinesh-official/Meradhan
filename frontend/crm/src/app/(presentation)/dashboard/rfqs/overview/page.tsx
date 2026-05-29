import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import RfqOverviewView from "./RfqOverviewView";

function RfqOverview() {
  return (
    <Workspace actionKey="rfqs.view">
    
      <RfqOverviewView />
    </Workspace>
  );
}

export default RfqOverview;
