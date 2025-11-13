"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import CustomerSearchFilterBar from "./_components/listView/CustomerSearchFilterBar";
import CustomerTable from "./_components/listView/CustomerTable";
import { useFilterListApiHook } from "./_components/listView/useCustomerListApiHook";
import { useCustomerFilterListHook } from "./_components/listView/useCustomerListHook";
import NewCustomerView from "./create/NewCustomerView";
function CustomersView() {
  const filterManager = useCustomerFilterListHook();
  const filterApiManager = useFilterListApiHook(filterManager);

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
          <Dialog>
            <DialogTrigger>
              <Button size={`sm`}>
                <Plus /> Add New Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="mt-0 p-0 min-w-[660px]">
              <NewCustomerView popup />
            </DialogContent>
          </Dialog>
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
