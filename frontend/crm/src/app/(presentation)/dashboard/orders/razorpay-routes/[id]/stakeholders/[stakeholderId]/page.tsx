import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import StakeholderDetailsView from "./view";

export default function Page() {
  return (
    <Workspace actionKey="orders.view">
      
        <StakeholderDetailsView />
      </Workspace>
  );
}

