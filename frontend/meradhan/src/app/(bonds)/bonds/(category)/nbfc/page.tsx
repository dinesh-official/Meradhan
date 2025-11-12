import apiServerCaller from "@/core/connection/apiServerCaller";
import ViewPort from "@/global/components/wrapper/ViewPort";
import apiGateway from "@root/apiGateway";
import { validateBondsFilters } from "../../../_utils/filter";
import BondsView from "../../BondsView";
import { cn } from "@/lib/utils";
import { generateBondCategoryMetaData } from "../_gql/getCategoryPageGql";

export const revalidate = 0;
export async function generateMetadata() {
  return await generateBondCategoryMetaData("nbfc");
}
async function BondPage({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ page?: string }>;
}) {
  const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);

  const filters = await searchParams;
  const queryFilter = validateBondsFilters(filters);
  const pageParams = await params;

  const { responseData } = await apiCaller.getListedBonds({
    filters: queryFilter,
    params: {
      page: pageParams.page ? parseInt(pageParams?.page as string, 10) : 1,
      category: "nbfc",
    },
  });

  return (
    <ViewPort>
      <BondsView
        category="nbfc"
        pathname="/bonds/nbfc"
        filter={queryFilter}
        bondsData={responseData}
        options={{
          showBondsByCategory: false,
          header: {
            title: (
              <>
                NBFC
                <span className="font-semibold text-secondary"> Bonds</span>
              </>
            ),
            // desc: "Get access to 26000+ bonds of India",
          },
          page: {
            title: (
              <>
                <h4 className={cn("font-medium text-3xl", "quicksand-medium")}>
                  All Listed NBFC{" "}
                  <span className="font-semibold text-secondary">Bonds</span> in
                  India
                </h4>
              </>
            ),
            desc: "Explore all NBFC bonds listed on Indian exchanges. Issued by Non-Banking Financial Companies, these bonds offer fixed-income opportunities backed by leading financial institutions.",
          },
        }}
      />
    </ViewPort>
  );
}

export default BondPage;
