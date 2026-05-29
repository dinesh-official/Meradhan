import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import RazorpayRouteAccountUpdateView from "./view";

export default function Page() {
  return (
    <Workspace actionKey="orders.view">
      
        <RazorpayRouteAccountUpdateView />
      </Workspace>
  );
}

