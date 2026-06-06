import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import RazorpayRouteAccountDetailsView from "./view";

export default function Page() {
  return (
    <Workspace actionKey="orders.view">
      
        <RazorpayRouteAccountDetailsView />
      </Workspace>
  );
}

