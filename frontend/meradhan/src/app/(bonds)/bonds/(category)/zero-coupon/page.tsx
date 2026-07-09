import apiServerCaller from "@/core/connection/apiServerCaller";
import ViewPort from "@/global/components/wrapper/ViewPort";
import apiGateway from "@root/apiGateway";
import { validateBondsFilters } from "../../../_utils/filter";
import BondsView from "../../BondsView";
import { cn } from "@/lib/utils";
import { generateBondCategoryMetaData } from "../_gql/getCategoryPageGql";

export const revalidate = 0;

export async function generateMetadata() {
  return await generateBondCategoryMetaData("zero-coupon");
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
       category: "zero-coupon",
    },
  });

  return (
    <ViewPort>
      <BondsView
        category="zero-coupon"
        pathname="/bonds/zero-coupon"
        filter={queryFilter}
        bondsData={responseData}
        options={{
          showBondsByCategory: false,
          header: {
            title: (
              <>
                Zero Coupon{" "}
                <span className="font-semibold text-secondary">Bonds</span>
              </>
            ),
            // desc: "Get access to 26000+ bonds of India",
          },
          page: {
            title: (
              <>
                <h4 className={cn("font-medium text-3xl", "quicksand-medium")}>
                  All Listed Zero Coupon{" "}
                  <span className="font-semibold text-secondary">Bonds</span> in
                  India
                </h4>
              </>
            ),
            desc: "Browse the complete list of zero coupon bonds. Invest in discounted bonds designed to deliver fixed returns over the long term.",
          },
        }}
      />
    </ViewPort>
  );
}

export default BondPage;
