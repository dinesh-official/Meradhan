import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PaymentProcessLogsView from "./PaymentProcessLogsView";

export default function Page() {
  return (
    <AllowOnlyView permissions={["view:orders"]}>
      <Workspace>
        <PaymentProcessLogsView />
      </Workspace>
    </AllowOnlyView>
  );
}
