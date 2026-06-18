import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import BondDocumentsManagementView from "./view";

export const revalidate = 0;

export default function BondDocumentsPage() {
  return (
    <AllowOnlyView permissions={["view:bonds"]}>
      <Workspace>
        <BondDocumentsManagementView />
      </Workspace>
    </AllowOnlyView>
  );
}
