import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import NewRfqFormView from "./_components/NewRfqForm";
function NseCreate() {
  return (
    <AllowOnlyView permissions={["create:rfq"]}>
      <Workspace>
        <NewRfqFormView />
      </Workspace>
    </AllowOnlyView>
  );
}

export default NseCreate;
