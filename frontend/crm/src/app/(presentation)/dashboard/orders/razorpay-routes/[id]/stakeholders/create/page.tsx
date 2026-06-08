import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import StakeholderCreateView from "./view";

export default function Page() {
  return (
    <AllowOnlyView permissions={["view:orders"]}>
      <Workspace>
        <StakeholderCreateView />
      </Workspace>
    </AllowOnlyView>
  );
}

