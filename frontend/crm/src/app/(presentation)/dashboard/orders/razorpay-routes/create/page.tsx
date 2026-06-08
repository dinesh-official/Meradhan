import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import RazorpayRouteAccountCreateView from "./view";

export default function Page() {
  return (
    <Workspace actionKey="orders.view">
      
        <RazorpayRouteAccountCreateView />
      </Workspace>
  );
}

