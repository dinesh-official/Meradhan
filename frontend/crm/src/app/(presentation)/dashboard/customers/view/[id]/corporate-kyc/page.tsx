import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
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
    <AllowOnlyView permissions={["view:customerkyc"]}>
      <Workspace>
        <CorporateProfileAndKycView profileId={id} />
      </Workspace>
    </AllowOnlyView>
  );
}

export default CorporateViewPage;
