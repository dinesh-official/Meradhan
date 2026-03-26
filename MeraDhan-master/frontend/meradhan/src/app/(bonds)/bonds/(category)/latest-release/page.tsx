import apiServerCaller from "@/core/connection/apiServerCaller";
import ViewPort from "@/global/components/wrapper/ViewPort";
import apiGateway from "@root/apiGateway";
import { validateBondsFilters } from "../../../_utils/filter";
import BondsView from "../../BondsView";
import { cn } from "@/lib/utils";
import { generateBondCategoryMetaData } from "../_gql/getCategoryPageGql";

export const revalidate = 0;
export async function generateMetadata() {
  return await generateBondCategoryMetaData("latest-release");
}
async function LatestRelease({
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
      category: "latest-release",
    },
  });

  return (
    <ViewPort>
      <BondsView
        category="latest-release"
        pathname="/bonds/latest-release"
        filter={queryFilter}
        bondsData={responseData}
        options={{
          showBondsByCategory: false,
          header: {
            title: (
              <>
                Recently Issued
                <span className="font-semibold text-secondary"> Bonds</span>
              </>
            ),
            // desc: "Get access to 26000+ bonds of India",
          },
          page: {
            title: (
              <>
                <h4 className={cn("font-medium text-3xl", "quicksand-medium")}>
                  Newly Listed
                  <span className="font-semibold text-secondary"> Bonds</span>
                </h4>
              </>
            ),
            desc: "Browse newly released bonds on our platform and find investment options that match your goals, from safety to returns.",
          },
        }}
      />
    </ViewPort>
  );
}

export default LatestRelease;
