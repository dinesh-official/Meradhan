import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import BondMarginManagementView from "./view";

export const revalidate = 0;

export default function BondMarginsPage() {
  return (
    <AllowOnlyView permissions={["edit:bonds"]}>
      <Workspace>
        <BondMarginManagementView />
      </Workspace>
    </AllowOnlyView>
  );
}

