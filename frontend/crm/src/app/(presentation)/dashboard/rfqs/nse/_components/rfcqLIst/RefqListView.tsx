"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "nextjs-toploader/app";
import NseRFQSearchFilterBar from "./NseRFQSearchFilterBar";
import NseTableView from "./NseTableView";
import { useRfqisinHook } from "./useRfqisinHook";

function NscRfqView() {
  const {
    findRfqSearchMutasion,
    setStatusValue,
    setRegTypeValue,
    filters,
    setRfqDate,
    setSearchValue,
  } = useRfqisinHook();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <NseRFQSearchFilterBar
          onStatusChange={(e) => {
            if (e == "ALL") {
              setStatusValue(undefined);
            } else {
              setStatusValue(e);
            }
          }}
          onRegTypeChange={(e) => setRegTypeValue(e)}
          rfqDateValue={filters.rfqDate}
          onRfqDateChange={(e: string) => setRfqDate(e)}
          searchValue={filters.searchValue}
          onSearchChange={(e) => setSearchValue(e.target.value)}
        />
        <CardContent>
          <NseTableView
            loading={findRfqSearchMutasion.isLoading}
            data={findRfqSearchMutasion.data?.responseData || []}
            onClick={(e) => {
              router.push(
                "/dashboard/rfqs/nse/manage/" + e.number + "?date=" + e.date
              );
            }}
          />
        </CardContent>
        {/* <CardPagination onClick={() => {}} page={10} totalPages={50} /> */}
      </Card>
    </div>
  );
}

export default NscRfqView;
