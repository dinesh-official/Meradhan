import apiServerCaller from "@/core/connection/apiServerCaller";
import ViewPort from "@/global/components/wrapper/ViewPort";
import apiGateway from "@root/apiGateway";
import { validateBondsFilters } from "../../../_utils/filter";
import BondsView from "../../BondsView";
import { cn } from "@/lib/utils";
import { generateBondCategoryMetaData } from "../_gql/getCategoryPageGql";

export const revalidate = 0;

export async function generateMetadata() {
  return await generateBondCategoryMetaData("tax-free");
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
      category: "tax-free",
    },
  });

  return (
    <ViewPort>
      <BondsView
        category="tax-free"
        pathname="/bonds/tax-free"
        filter={queryFilter}
        bondsData={responseData}
        options={{
          showBondsByCategory: false,
          header: {
            title: (
              <>
                Tax Free{" "}
                <span className="font-semibold text-secondary">Bonds</span>
              </>
            ),
            // desc: "Get access to 26000+ bonds of India",
          },
          page: {
            title: (
              <>
                <h4 className={cn("font-medium text-3xl", "quicksand-medium")}>
                  All Tax Free{" "}
                  <span className="font-semibold text-secondary">Bonds</span>
                </h4>
              </>
            ),
            desc: "Explore a comprehensive list of tax-free bonds available in MeraDhan’s database.",
          },
        }}
      />
    </ViewPort>
  );
}

export default BondPage;
