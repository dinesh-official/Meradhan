import { Button } from "@/components/ui/button";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import NscRfqView from "./_components/rfcqLIst/RefqListView";
import RefqAllDataView from "./_components/rfcqLIst/RefqAllDataView";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";

function NscRfqViewPage() {
  return (
    <div>
      <PageInfoBar
        title="NSE RFQ Management"
        description="Manage NSE Request for Quote records"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/rfqs/nse/webhook-notifications">
              <Button type="button" variant="outline" size="sm">
                <Bell className="size-4" />
                Webhook notifications
              </Button>
            </Link>
            <AllowOnlyView actionKey="rfqs.manage">
              <Link href={`/dashboard/rfqs/nse/create`}>
                <Button>
                  <Plus /> Create New RFQ
                </Button>
              </Link>
            </AllowOnlyView>
          </div>
        }
      />
      <br />
      <NscRfqView />
      <br />
      <RefqAllDataView />
    </div>
  );
}

export default NscRfqViewPage;
