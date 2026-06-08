import apiServerCaller from "@/core/connection/apiServerCaller";

import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import apiGateway from "@root/apiGateway";
import { validateBondsFilters } from "./_utils/filter";
import BondsView from "./BondsView";

export const revalidate = 0; // Revalidate the page every hour

async function BondPage({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ page?: string }>;
}) {
  const filters = await searchParams;
  const queryFilter = validateBondsFilters(filters);
  const pageParams = await params;

  const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);
  const { responseData } = await apiCaller.getListedBonds({
    filters: queryFilter,
    params: {
      page: pageParams.page ? parseInt(pageParams?.page as string, 10) : 1,
      category: "all",
      all: "YES",
      limit: 100,
    },
  });

  return (
    <AllowOnlyView permissions={["view:bonds"]}>
      <Workspace>
        <BondsView
          pathname="/bonds"
          category="all"
          filter={queryFilter}
          bondsData={responseData}
        />
      </Workspace>
    </AllowOnlyView>
  );
}

export default BondPage;
