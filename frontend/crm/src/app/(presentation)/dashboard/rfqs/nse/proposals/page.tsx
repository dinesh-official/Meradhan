import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import ProposalManagementView from "./ProposalManagementView";

function page() {
  return (
    <Workspace actionKey="rfqs.proposals.view">
      
        <PageInfoBar
          title="Proposal Management"
          description="Create a proposal from ISIN, customer, and quantity."
        />
        <ProposalManagementView />
      </Workspace>
  );
}

export default page;
