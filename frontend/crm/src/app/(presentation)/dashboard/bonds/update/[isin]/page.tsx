/* eslint-disable @typescript-eslint/no-explicit-any */
import apiServerCaller from "@/core/connection/apiServerCaller";
import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import apiGateway from "@root/apiGateway";
import { BondDetailsResponse } from "@root/apiGateway";
import BondForm from "../../create/_components/BondForm";

async function UpdateBondPage({
  params,
}: {
  params: Promise<{ isin: string }>;
}) {
  const { isin } = await params;
  const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);

  let bondData: BondDetailsResponse | null = null;
  try {
    const response = await apiCaller.getBondDetailsByIsin(isin);
    bondData = response.responseData;
  } catch {
    // Silently handle error - will show error state in component
  }

  return (
    <Workspace>
      <PageInfoBar
        title="Update Bond"
        description={`Update bond details for ISIN: ${isin}`}
        showBack
      />

      {bondData && <BondForm initialData={bondData as any} isin={isin} />}
    </Workspace>
  );
}

export default UpdateBondPage;
