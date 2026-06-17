import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import ProposalManagementView from "./ProposalManagementView";

function page() {
  return (
    <AllowOnlyView permissions={["view:rfq"]}>
      <Workspace>
        <PageInfoBar
          title="Proposal Management"
          description="Create a proposal from ISIN, RFQ participant (with saved info), or customer, and quantity."
        />
        <ProposalManagementView />
      </Workspace>
    </AllowOnlyView>
  );
}

export default page;
