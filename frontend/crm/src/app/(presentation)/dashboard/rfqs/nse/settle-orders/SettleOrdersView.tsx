"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SettleOrdersFilters from "./SettleOrdersFilters";
import SettleOrdersTable from "./SettleOrdersTable";
import { useSettleOrdersApiHook } from "./hooks/useSettleOrdersApiHook";
import { useSettleOrdersFilterHook } from "./hooks/useSettleOrdersFilterHook";
import { FileDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

function SettleOrdersView() {
  const filterManager = useSettleOrdersFilterHook();
  const router = useRouter();
  const [selectedForPdf, setSelectedForPdf] = useState<Set<string>>(new Set());

  const { fetchSettleOrdersQuery } = useSettleOrdersApiHook(filterManager);
  const settleOrders = fetchSettleOrdersQuery?.data?.responseData || [];

  const handleTogglePdfOrder = (orderNumber: string, checked: boolean) => {
    if (checked) {
      setSelectedForPdf(new Set([orderNumber]));
    } else {
      setSelectedForPdf((prev) => {
        const next = new Set(prev);
        next.delete(orderNumber);
        return next;
      });
    }
  };

  const selectedOrderNumber = selectedForPdf.size === 1 ? Array.from(selectedForPdf)[0] : null;

  const handleGeneratePdf = () => {
    if (selectedOrderNumber) {
      router.push(`/dashboard/rfqs/nse/settle-orders/generate/${selectedOrderNumber}`);
    }
  };

  return (
    <div className="flex flex-col gap-5 mt-5">
      <Card>
        <SettleOrdersFilters
          filterManager={filterManager}
          onRefresh={() => fetchSettleOrdersQuery.refetch()}
          isLoading={fetchSettleOrdersQuery.isLoading}
        />

        <CardContent>
          {selectedOrderNumber && (
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={handleGeneratePdf}>
                <FileDown className="mr-2 h-4 w-4" />
                Generate PDF
              </Button>
            </div>
          )}
          <SettleOrdersTable
            data={settleOrders}
            isLoading={fetchSettleOrdersQuery.isLoading}
            selectedForPdf={selectedForPdf}
            onTogglePdfOrder={handleTogglePdfOrder}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default SettleOrdersView;
