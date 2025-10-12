"use client";
import { Card, CardContent } from "@/components/ui/card";
import StatusCountCard from "@/global/elements/cards/StatusCountCard";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import Table from "../../Table";
import RefqOverviewSearchFilterBar from "./_components/RefqOverviewSearchFilterBar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function RfqOverviewView() {
  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="RFQ Management"
        description="Manage Request for Quotes and NSE submissions"
        actions={
          <Link href={`/dashboard/leads/create`}>
            <Button>
              <Plus /> Create New Rfq
            </Button>
          </Link>
        }
      />
      <div className="grid grid-cols-4 gap-5">
        <StatusCountCard
          title="Total RFQs"
          value={100}
          arrowType="none"
          changeText=""
          variant="purpleGradient"
        />
        <StatusCountCard
          title="Total RFQs"
          value={100}
          arrowType="none"
          changeText=""
          variant="orangeGradient"
        />
        <StatusCountCard
          title="Executed"
          value={100}
          arrowType="none"
          changeText=""
          variant="greenGradient"
        />
        <StatusCountCard
          title="Total Value"
          value={100}
          arrowType="none"
          changeText=""
          variant="indigoGradient"
        />
      </div>

      <Card>
        <RefqOverviewSearchFilterBar />
        <CardContent>
          <Table />
        </CardContent>
        <CardPagination onClick={() => {}} page={1} totalPages={10} />
      </Card>
    </div>
  );
}

export default RfqOverviewView;
