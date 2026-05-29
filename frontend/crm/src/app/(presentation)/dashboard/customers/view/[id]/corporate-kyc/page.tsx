import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import { decodeId } from "@/global/utils/url.utils";
import CorporateProfileAndKycView from "./CorporateProfileAndKycView";

export const revalidate = 0;

async function CorporateViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: encodedId } = await params;
  const id = decodeId(encodedId);

  return (
    <Workspace actionKey="customers.kyc.view">
      
        <CorporateProfileAndKycView profileId={id} />
      </Workspace>
  );
}

export default CorporateViewPage;
