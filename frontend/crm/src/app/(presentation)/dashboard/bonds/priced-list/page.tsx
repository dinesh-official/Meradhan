import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import BondPricedListView from "./view";

export const revalidate = 0;

export default function BondPricedListPage() {
  return (
    <AllowOnlyView permissions={["view:bonds"]}>
      <Workspace>
        <BondPricedListView />
      </Workspace>
    </AllowOnlyView>
  );
}

