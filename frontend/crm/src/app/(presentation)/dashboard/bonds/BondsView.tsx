"use client";
import CardPagination from "@/global/elements/table/CardPagination";
import { ListedBondsResponse } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useRouter } from "nextjs-toploader/app";
import z from "zod";
import { BondListCard } from "./_components/BondListCard";
import ExploreBondsHeader from "./_components/ExploreBondsHeader";
import useBondsFilters from "./_hooks/useBondsFilters";

function BondsView({
  bondsData,
  pathname,
}: {
  filter: z.infer<typeof appSchema.bonds.bondsFilterSchema>;
  bondsData: ListedBondsResponse["responseData"];
  pathname: string;
  category: string;
}) {
  const router = useRouter();
  const bondFilterManager = useBondsFilters({
    category: "all",
    pathname: "/dashboard/bonds",
  });

  const bondsListData =
    bondFilterManager.applyFilterMutation.data?.responseData || bondsData;

  return (
    <div>
      <ExploreBondsHeader
        manager={bondFilterManager}
        rootUrl={pathname}
        applyFilters={() => {
          bondFilterManager.applyFilters(bondFilterManager.filters);
        }}
      />
      <div className="flex flex-col justify-center items-center mb-5 py-14 lg:py-0 w-full">
        <div className="gap-5 grid grid-cols-3 container">
          {bondsListData?.data.map((bond) => (
            <BondListCard key={bond.isin} gridMode={true} data={bond} />
          ))}
        </div>
      </div>
      <CardPagination
        onClick={(e) => {
          router.push(`/dashboard/bonds/page/${e}`);
        }}
        page={bondsListData?.meta.page || 1}
        totalPages={bondsListData?.meta.totalPages || 1}
      />
    </div>
  );
}

export default BondsView;
