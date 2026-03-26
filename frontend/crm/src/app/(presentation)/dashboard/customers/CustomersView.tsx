"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Download, Plus } from "lucide-react";
import { useState } from "react";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import CustomerSearchFilterBar from "./_components/listView/CustomerSearchFilterBar";
import CustomerTable from "./_components/listView/CustomerTable";
import { downloadCustomersCsv } from "./_components/listView/exportCustomersCsv";
import { useFilterListApiHook } from "./_components/listView/useCustomerListApiHook";
import { useCustomerFilterListHook } from "./_components/listView/useCustomerListHook";
import NewCustomerView from "./create/NewCustomerView";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";

function CustomersView() {
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const filterManager = useCustomerFilterListHook();
  const filterApiManager = useFilterListApiHook(filterManager);

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const customerApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
      const res = await customerApi.getCustomer({
        page: "1",
        pageSize: 50000
      });
      const data = res.data?.responseData?.data ?? [];
      downloadCustomersCsv(data);
    } finally {
      setExportLoading(false);
    }
  };

  const isShowPagination = () => {
    return (
      (filterApiManager.fetchCustomerQuery.data?.responseData.data.length ||
        0) > 0 &&
      filterApiManager.fetchCustomerQuery.data?.responseData.meta.totalPages !=
      1 &&
      !filterApiManager.fetchCustomerQuery.isPending
    );
  };
  return (
    <div>
      <PageInfoBar
        title="Customer Management"
        description="Manage customer profiles and KYC status"
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={exportLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {exportLoading ? "Exporting…" : "Export CSV"}
            </Button>
            <AllowOnlyView permissions={["create:customer"]}>
              <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus /> Add New Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="mt-0 p-0 min-w-[660px]">
                  <NewCustomerView
                    popup
                    onCustomerCreated={() => setAddCustomerOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </AllowOnlyView>
          </>
        }
      />
      <Card className="mt-5">
        <CustomerSearchFilterBar
          placeholder="Search Customer..."
          kycValue={filterManager.state.accountKycStatus}
          statusValue={filterManager.state.accountStatus}
          searchValue={filterManager.state.search}
          onKycChange={filterManager.state.setAccountKycStatus}
          onSearchChange={filterManager.state.setSearch}
          onStatusChange={filterManager.state.setAccountStatus}
        />
        <CardContent>
          <CustomerTable
            data={
              filterApiManager.fetchCustomerQuery.data?.responseData.data || []
            }
            isLoading={filterApiManager.fetchCustomerQuery.isLoading}
          />
        </CardContent>

        {isShowPagination() && (
          <CardPagination
            onClick={filterManager.state.setPaginationIndex}
            page={filterManager.state.paginationIndex}
            totalPages={
              filterApiManager.fetchCustomerQuery.data?.responseData.meta
                .totalPages || 1
            }
          />
        )}
      </Card>
    </div>
  );
}

export default CustomersView;
