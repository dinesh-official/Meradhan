import { Button } from "@/components/ui/button";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
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
          <AllowOnlyView permissions={['create:rfq']} >
            <Link href={`/dashboard/rfqs/nse/create`}>
              <Button>
                <Plus /> Create New RFQ
              </Button>
            </Link>
          </AllowOnlyView>
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
