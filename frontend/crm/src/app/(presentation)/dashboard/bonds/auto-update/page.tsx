import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import BondAutoUpdateView from "./BondAutoUpdateView";

export const revalidate = 0;

export default function BondAutoUpdatePage() {
  return (
    <AllowOnlyView permissions={["view:bonds"]}>
      <Workspace>
        <PageInfoBar
          title="Bond auto-update (sale-ready)"
          description="Bonds with “Allow for purchase” enabled. Load autofill from the calculator API, review and edit suggested fields, then accept or reject per bond."
          showBack
        />
        <div className="container mx-auto max-w-6xl py-6 px-4">
          <BondAutoUpdateView />
        </div>
      </Workspace>
    </AllowOnlyView>
  );
}
