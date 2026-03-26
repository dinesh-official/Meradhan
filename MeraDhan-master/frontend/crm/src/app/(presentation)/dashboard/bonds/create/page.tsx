import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import BondForm from "./_components/BondForm";

function CreateBondPage() {
  return (
    <AllowOnlyView permissions={["create:bonds"]}>
    <Workspace>
      <PageInfoBar
        title="Create Bond"
        description="Add a new bond to the system"
        showBack
      />
      <BondForm />
    </Workspace>
    </AllowOnlyView>
  );
}

export default CreateBondPage;
