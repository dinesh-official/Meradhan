import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import BondForm from "./_components/BondForm";

function CreateBondPage() {
  return (
    <Workspace actionKey="bonds.create">
    
      <PageInfoBar
        title="Create Bond"
        description="Add a new bond to the system"
        showBack
      />
      <BondForm />
    </Workspace>
  );
}

export default CreateBondPage;
