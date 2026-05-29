import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import NewRfqFormView from "./_components/NewRfqForm";
function NseCreate() {
  return (
    <Workspace actionKey="rfqs.manage">
      
        <NewRfqFormView />
      </Workspace>
  );
}

export default NseCreate;
