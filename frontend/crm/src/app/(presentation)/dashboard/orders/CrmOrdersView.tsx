"use client";
import { Card, CardContent } from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import OrderSearchFilterBar from "./_components/listView/OrderSearchFilterBar";
import OrderTable from "./_components/listView/OrderTable";
import { useOrderFilterListHook } from "./_components/listView/useOrderListHook";
import { useOrderFilterListApiHook } from "./_components/listView/useOrderListApiHook";

function CrmOrdersView() {
  const filterManager = useOrderFilterListHook();
  const filterApiManager = useOrderFilterListApiHook(filterManager);

  const isShowPagination = () => {
    return (
      (filterApiManager.fetchOrderQuery.data?.responseData.data.length || 0) >
        0 &&
      filterApiManager.fetchOrderQuery.data?.responseData.meta.totalPages !=
        1 &&
      !filterApiManager.fetchOrderQuery.isPending
    );
  };

  return (
    <div>
      <PageInfoBar
        title="Order Management"
        description="Manage customer orders and track settlement status"
      />
      <Card className="mt-5">
        <OrderSearchFilterBar
          placeholder="Search by customer name, email, bond name, ISIN..."
          searchValue={filterManager.state.search}
          onSearchChange={filterManager.state.setSearch}
          statusValue={filterManager.state.statusFilter}
          onStatusChange={filterManager.state.setStatusFilter}
          bondTypeValue={filterManager.state.bondTypeFilter}
          onBondTypeChange={filterManager.state.setBondTypeFilter}
          date={filterManager.state.date}
          onDateChange={filterManager.state.setDate}
          onClearFilters={filterManager.state.resetAll}
        />
        <CardContent>
          <OrderTable
            data={
              filterApiManager.fetchOrderQuery.data?.responseData.data || []
            }
            isLoading={filterApiManager.fetchOrderQuery.isLoading}
          />
        </CardContent>

        {isShowPagination() && (
          <CardPagination
            onClick={filterManager.state.setPaginationIndex}
            page={filterManager.state.paginationIndex}
            totalPages={
              filterApiManager.fetchOrderQuery.data?.responseData.meta
                .totalPages || 1
            }
          />
        )}
      </Card>
    </div>
  );
}

export default CrmOrdersView;
