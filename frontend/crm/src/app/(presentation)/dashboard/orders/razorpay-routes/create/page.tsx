import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import RazorpayRouteAccountCreateView from "./view";

export default function Page() {
  return (
    <AllowOnlyView permissions={["view:orders"]}>
      <Workspace>
        <RazorpayRouteAccountCreateView />
      </Workspace>
    </AllowOnlyView>
  );
}

