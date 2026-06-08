import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import CbricsManagerView from "./CbricsManagerView";

export default function CbricsManagerPage() {
  return (
    <Workspace>
      <PageInfoBar
        title="CBRICS manager"
        description="Inspect and act on NSE CBRICS unregistered participants, bank accounts, and DP accounts. Uses live CBRICS APIs; changes apply on the exchange side."
      />
      <CbricsManagerView />
    </Workspace>
  );
}
