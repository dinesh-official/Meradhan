import { Button } from "@/components/ui/button";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import NscRfqView from "./_components/rfcqLIst/RefqListView";
import RefqAllDataView from "./_components/rfcqLIst/RefqAllDataView";

function NscRfqViewPage() {
  return (
    <div>
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
      <br />
      <NscRfqView />
      <br />
      <RefqAllDataView />
    </div>
  );
}

export default NscRfqViewPage;
