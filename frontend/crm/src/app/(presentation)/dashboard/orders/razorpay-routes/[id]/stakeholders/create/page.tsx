import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import StakeholderCreateView from "./view";

export default function Page() {
  return (
    <Workspace actionKey="orders.view">
      
        <StakeholderCreateView />
      </Workspace>
  );
}

