"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import Link from "next/link";
import NseRFQSearchFilterBar from "./_components/rfcqLIst/NseRFQSearchFilterBar";
import NseTableView from "./_components/rfcqLIst/NseTableView";
import { useRfqisinHook } from "./_components/rfcqLIst/useRfqisinHook";
import { useRouter } from "nextjs-toploader/app";

function NscRfqView() {
  const { findRfqSearchMutasion } = useRfqisinHook();
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
        <NseRFQSearchFilterBar />
        <CardContent>
          <NseTableView
            loading={findRfqSearchMutasion.isLoading}
            data={findRfqSearchMutasion.data?.responseData || []}
            onClick={(e) => {
              router.push("/dashboard/rfqs/nse/manage/" + e.number);
            }}
          />
        </CardContent>
        {/* <CardPagination onClick={() => {}} page={10} totalPages={50} /> */}
      </Card>
    </div>
  );
}

export default NscRfqView;
