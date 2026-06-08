import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import StakeholderUpdateView from "./view";

export default function Page() {
  return (
    <AllowOnlyView permissions={["view:orders"]}>
      <Workspace>
        <StakeholderUpdateView />
      </Workspace>
    </AllowOnlyView>
  );
}

