/* eslint-disable @typescript-eslint/no-explicit-any */
import apiServerCaller from "@/core/connection/apiServerCaller";
import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import apiGateway from "@root/apiGateway";
import { BondDetailsResponse } from "@root/apiGateway";
import BondForm from "../../create/_components/BondForm";
import { BondDocumentsSection } from "../../_components/BondDocumentsSection";

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

      {bondData ? (
        <div className="space-y-8">
          <BondForm initialData={bondData as any} isin={isin} />
          <BondDocumentsSection
            isin={isin}
            bondName={bondData.bondName || bondData.instrumentName}
          />
        </div>
      ) : null}
    </Workspace>
  );
}

export default UpdateBondPage;
