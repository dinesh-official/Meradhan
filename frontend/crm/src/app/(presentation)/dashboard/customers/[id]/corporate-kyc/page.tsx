import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import { decodeId } from "@/global/utils/url.utils";
import CorporateKycPageView from "./CorporateKycPageView";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);

  return (
    <Workspace>
      <CorporateKycPageView customerId={id} />
    </Workspace>
  );
}

export default page;
