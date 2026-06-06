import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import BondPricedListView from "./view";

export const revalidate = 0;

export default function BondPricedListPage() {
  return (
    <Workspace actionKey="bonds.priced_list.view">
      
        <BondPricedListView />
      </Workspace>
  );
}

