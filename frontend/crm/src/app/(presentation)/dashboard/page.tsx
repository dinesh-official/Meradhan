import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import DashBoardView from "./DashBoardView";

function page() {
  return (
    <Workspace actionKey="dashboard.view">
      <DashBoardView />
    </Workspace>
  );
}

export default page;
