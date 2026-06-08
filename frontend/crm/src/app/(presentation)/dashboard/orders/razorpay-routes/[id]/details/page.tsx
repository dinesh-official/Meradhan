import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import RazorpayRouteAccountDetailsView from "./view";

export default function Page() {
  return (
    <AllowOnlyView permissions={["view:orders"]}>
      <Workspace>
        <RazorpayRouteAccountDetailsView />
      </Workspace>
    </AllowOnlyView>
  );
}

