import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import DraftOrdersView from "./DraftOrdersView";

export const revalidate = 0;

export default function DraftOrdersPage() {
  return (
    <Workspace actionKey="orders.view">
      
        <DraftOrdersView />
      </Workspace>
  );
}
