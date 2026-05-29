import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PaymentProcessLogsView from "./PaymentProcessLogsView";

export default function Page() {
  return (
    <Workspace actionKey="orders.view">
      
        <PaymentProcessLogsView />
      </Workspace>
  );
}
