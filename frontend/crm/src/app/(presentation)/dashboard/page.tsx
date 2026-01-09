import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import DashBoardView from "./DashBoardView";

function page() {
  return (
    <AllowOnlyView permissions={["view:dashboard"]}>
      <Workspace>
        <DashBoardView />
      </Workspace>
    </AllowOnlyView>
  );
}

export default page;
