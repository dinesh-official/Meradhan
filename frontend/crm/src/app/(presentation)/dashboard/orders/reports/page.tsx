import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import OrderReportsView from "./OrderReportsView";

export default function OrderReportsPage() {
  return (
    <Workspace actionKey="orders.reports.view">
      
        <OrderReportsView />
      </Workspace>
  );
}
