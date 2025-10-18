import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import CustomerProfileView from "./CustomerProfileView";

async function page({ params }: { params: Promise<{ id: number }> }) {
  const { id } = await params;


  return (
    <Workspace>
      <CustomerProfileView profileId = {id}/>
    </Workspace>
  );
}

export default page;
