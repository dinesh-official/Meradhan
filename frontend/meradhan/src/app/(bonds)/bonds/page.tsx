import apiServerCaller from "@/core/connection/apiServerCaller";
import ViewPort from "@/global/components/wrapper/ViewPort";
import apiGateway from "@root/apiGateway";
import { validateBondsFilters } from "../_utils/filter";
import BondsView from "./BondsView";
import { cn } from "@/lib/utils";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";

export const revalidate = 0;

export const generateMetadata = async () => {
  return await generatePagesMetaData("bonds");
};

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
    },
  });

  return (
    <ViewPort>
      <BondsView
        pathname="/bonds"
        category="all"
        filter={queryFilter}
        bondsData={responseData}
        options={{
          showBondsByCategory: true,
          showUpcomingBonds: true,
          header: {
            title: (
              <>
                Exclusive{" "}
                <span className="font-semibold text-secondary">
                  Bonds Directory
                </span>
              </>
            ),
            desc: "Get access to 26000+ bonds of India",
          },
          page: {
            title: (
              <>
                <h4 className={cn("font-medium text-3xl", "quicksand-medium")}>
                  All{" "}
                  <span className="font-semibold text-secondary">Bonds</span>
                </h4>
              </>
            ),
            desc: "Explore a comprehensive list of bonds available in MeraDhan’s database.",
          },
        }}
      />
    </ViewPort>
  );
}

export default BondPage;
