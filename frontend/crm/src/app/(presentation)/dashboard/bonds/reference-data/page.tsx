import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import BondReferenceDataView from "./view";

export const revalidate = 0;

export default function BondReferenceDataPage() {
  return (
    <AllowOnlyView permissions={["view:bonds"]}>
      <Workspace>
        <BondReferenceDataView />
      </Workspace>
    </AllowOnlyView>
  );
}

