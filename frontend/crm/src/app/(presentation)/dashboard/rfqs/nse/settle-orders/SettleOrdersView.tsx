"use client";
import { Card, CardContent } from "@/components/ui/card";
import SettleOrdersFilters from "./SettleOrdersFilters";
import SettleOrdersTable from "./SettleOrdersTable";
import { useSettleOrdersApiHook } from "./hooks/useSettleOrdersApiHook";
import { useSettleOrdersFilterHook } from "./hooks/useSettleOrdersFilterHook";
import { Button } from "@/components/ui/button";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileDown } from "lucide-react";

function SettleOrdersView() {
  // Initialize filter management
  const filterManager = useSettleOrdersFilterHook();
  const router = useRouter();
  const [openGenerateModal, setOpenGenerateModal] = useState(false);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState("");

  // Initialize API hook with filter state
  const { fetchSettleOrdersQuery } = useSettleOrdersApiHook(filterManager);
  const settleOrders = fetchSettleOrdersQuery?.data?.responseData || [];
  const selectedOrder = settleOrders.find(
    (order) => String(order.orderNumber) === selectedOrderNumber
  );

  const handleRedirectToGenerate = () => {
    if (!selectedOrderNumber) return;
    setOpenGenerateModal(false);
    router.push(`/dashboard/rfqs/nse/settle-orders/generate/${selectedOrderNumber}`);
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
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              onClick={() => setOpenGenerateModal(true)}
              disabled={!settleOrders.length}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Generate PDF
            </Button>
          </div>
          <SettleOrdersTable
            data={settleOrders}
            isLoading={fetchSettleOrdersQuery.isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={openGenerateModal} onOpenChange={setOpenGenerateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate PDF</DialogTitle>
            <DialogDescription>
              Select settlement order and continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 w-full">
            <Select
              value={selectedOrderNumber}
              onValueChange={setSelectedOrderNumber}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select order number" />
              </SelectTrigger>
              <SelectContent>
                {settleOrders.map((order) => (
                  <SelectItem key={order.id} value={String(order.orderNumber)}>
                    {String(order.orderNumber)} {order.symbol ? `| ${String(order.symbol)}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOrder && (
            <div className="rounded-md border p-3 space-y-2 text-sm">
              <div className="font-medium">Selected order details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Order Number:</span>{" "}
                  {selectedOrder.orderNumber}
                </div>
                <div>
                  <span className="font-medium text-foreground">Symbol:</span>{" "}
                  {selectedOrder.symbol || "--"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Buy Participant:</span>{" "}
                  {selectedOrder.buyParticipantLoginId || "--"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Sell Participant:</span>{" "}
                  {selectedOrder.sellParticipantLoginId || "--"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Price:</span>{" "}
                  {selectedOrder.price ?? "--"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Yield:</span>{" "}
                  {selectedOrder.yield ?? "--"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Quantity:</span>{" "}
                  {selectedOrder.modQuantity ?? "--"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Settlement No:</span>{" "}
                  {selectedOrder.settlementNo || "--"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Settlement Date:</span>{" "}
                  {selectedOrder.modSettleDate
                    ? dateTimeUtils.formatDateTime(selectedOrder.modSettleDate, "DD MMM YYYY")
                    : "--"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Status:</span>{" "}
                  {selectedOrder.settleStatus ?? "--"}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenGenerateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRedirectToGenerate} disabled={!selectedOrderNumber}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SettleOrdersView;
