import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import BondReferenceDataView from "./view";

export const revalidate = 0;

export default function BondReferenceDataPage() {
  return (
    <Workspace actionKey="bonds.reference_data.view">
      
        <BondReferenceDataView />
      </Workspace>
  );
}

