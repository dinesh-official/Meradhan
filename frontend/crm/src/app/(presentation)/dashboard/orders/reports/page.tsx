import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import OrderReportsView from "./OrderReportsView";

export default function OrderReportsPage() {
  return (
    <AllowOnlyView permissions={["view:orders"]}>
      <Workspace>
        <OrderReportsView />
      </Workspace>
    </AllowOnlyView>
  );
}
