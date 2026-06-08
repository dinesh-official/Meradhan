import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import DraftOrdersView from "./DraftOrdersView";

export const revalidate = 0;

export default function DraftOrdersPage() {
  return (
    <AllowOnlyView permissions={["view:orders"]}>
      <Workspace>
        <DraftOrdersView />
      </Workspace>
    </AllowOnlyView>
  );
}
