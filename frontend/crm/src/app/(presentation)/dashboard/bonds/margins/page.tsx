import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import BondMarginManagementView from "./view";

export const revalidate = 0;

export default function BondMarginsPage() {
  return (
    <Workspace actionKey="bonds.margins.view">
      
        <BondMarginManagementView />
      </Workspace>
  );
}
