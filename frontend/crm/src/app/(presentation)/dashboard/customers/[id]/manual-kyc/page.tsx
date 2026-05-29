import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import { decodeId } from "@/global/utils/url.utils";
import ManualKycPageView from "./ManualKycPageView";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);

  return (
    <Workspace actionKey="customers.kyc.edit">
      
        <ManualKycPageView customerId={id} />
      </Workspace>
  );
}

export default page;
