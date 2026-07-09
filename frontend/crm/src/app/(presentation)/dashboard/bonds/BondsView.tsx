"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import { ListedBondsResponse } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useRouter } from "nextjs-toploader/app";
import z from "zod";
import BondsTable from "./_components/BondsTable";
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
    <Card>
      <CardHeader >
        <ExploreBondsHeader
          manager={bondFilterManager}
          rootUrl={pathname}
          applyFilters={() => {
            bondFilterManager.applyFilters(bondFilterManager.filters);
          }}
        />
      </CardHeader>
      <CardContent>
        <BondsTable
          data={bondsListData?.data || []}
          isLoading={bondFilterManager.applyFilterMutation.isPending}
          pageSize={100}
        />

      </CardContent>

      {bondsListData && bondsListData.meta.totalPages > 1 && (
        <CardPagination
          onClick={(e) => {
            router.push(`/dashboard/bonds/page/${e}`);
          }}
          page={bondsListData.meta.page || 1}
          totalPages={bondsListData.meta.totalPages || 1}
        />
      )}

    </Card>
  );
}

export default BondsView;
