import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import BondAutoUpdateView from "./BondAutoUpdateView";

export const revalidate = 0;

export default function BondAutoUpdatePage() {
  return (
    <Workspace actionKey="bonds.auto_update.view">
      
        <PageInfoBar
          title="Bond auto-update (sale-ready)"
          description="Bonds with “Allow for purchase” enabled. Load deal autofill from the calculator API, review and edit suggested fields, then accept or reject per bond."
          showBack
        />
        <div className="container mx-auto max-w-6xl py-6 px-4">
          <BondAutoUpdateView />
        </div>
      </Workspace>
  );
}
