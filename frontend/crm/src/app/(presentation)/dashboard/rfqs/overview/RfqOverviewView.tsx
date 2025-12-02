"use client";
import { Button } from "@/components/ui/button";
import StatusCountCard from "@/global/elements/cards/StatusCountCard";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import Link from "next/link";
import SettleOrdersView from "../nse/settle-orders/SettleOrdersView";

function RfqOverviewView() {
  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="RFQ Management"
        description="Manage Request for Quotes and NSE submissions"
        actions={
          <Link href={`/dashboard/leads/create`}>
            <Button>
              <Plus /> Create New RFQ
            </Button>
          </Link>
        }
      />
      <div className="gap-5 grid grid-cols-4">
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

      <SettleOrdersView />
    </div>
  );
}

export default RfqOverviewView;
