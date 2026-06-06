import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import InventoryStockView from "./InventoryStockView";

export const revalidate = 0;

export default function InventoryStockPage() {
  return (
    <Workspace actionKey="orders.inventory.view">
      
        <InventoryStockView />
      </Workspace>
  );
}
