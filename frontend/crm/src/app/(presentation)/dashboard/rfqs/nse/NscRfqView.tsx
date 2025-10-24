"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import Link from "next/link";
import Table from "../../Table";
import NseRFQSearchFilterBar from "./_components/NseRFQSearchFilterBar";

function NscRfqView() {
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
          <Table />
        </CardContent>
        <CardPagination onClick={() => {}} page={10} totalPages={50} />
      </Card>
    </div>
  );
}

export default NscRfqView;
