"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import NseRFQSearchFilterBar from "./_components/rfcqLIst/NseRFQSearchFilterBar";
import NseTableView from "./_components/rfcqLIst/NseTableView";
import { useRfqisinHook } from "./_components/rfcqLIst/useRfqisinHook";

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
      <PageInfoBar
        title="NSE RFQ Management"
        description="Manage NSE Request for Quote records"
        actions={
          <Link href={`/dashboard/rfqs/nse/create`}>
            <Button>
              <Plus /> Create New RFQ
            </Button>
          </Link>
        }
      />

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
          onRfqDateChange={(e) => setRfqDate(e.target.value)}
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
