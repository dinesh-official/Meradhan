"use client";
import { Card, CardContent } from "@/components/ui/card";
import SettleOrdersFilters from "./SettleOrdersFilters";
import SettleOrdersTable from "./SettleOrdersTable";
import { useSettleOrdersApiHook } from "./hooks/useSettleOrdersApiHook";
import { useSettleOrdersFilterHook } from "./hooks/useSettleOrdersFilterHook";

function SettleOrdersView() {
  // Initialize filter management
  const filterManager = useSettleOrdersFilterHook();

  // Initialize API hook with filter state
  const { fetchSettleOrdersQuery } = useSettleOrdersApiHook(filterManager);

  return (
    <div className="flex flex-col gap-5 mt-5">
      <Card>
        <SettleOrdersFilters
          filterManager={filterManager}
          onRefresh={() => fetchSettleOrdersQuery.refetch()}
          isLoading={fetchSettleOrdersQuery.isLoading}
        />

        <CardContent>
          <SettleOrdersTable
            data={fetchSettleOrdersQuery?.data?.responseData || []}
            isLoading={fetchSettleOrdersQuery.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default SettleOrdersView;
