import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import InventoryStockView from "./InventoryStockView";

export const revalidate = 0;

export default function InventoryStockPage() {
  return (
    <AllowOnlyView permissions={["view:orders"]}>
      <Workspace>
        <InventoryStockView />
      </Workspace>
    </AllowOnlyView>
  );
}
