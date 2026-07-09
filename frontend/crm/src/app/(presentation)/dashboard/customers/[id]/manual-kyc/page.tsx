import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import ManualKycPageView from "./ManualKycPageView";
import { decodeId } from "@/global/utils/url.utils";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);

  return (
    <Workspace>
      <ManualKycPageView customerId={id} />
    </Workspace>
  );
}

export default page;

