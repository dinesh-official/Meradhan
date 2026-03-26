"use client";

import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { CreateNegotiationResponse } from "@root/apiGateway";
import { Check, Edit, X } from "lucide-react";
import DealConfirmPopup from "../../_components/DealConfirm";
import AcceptDealPopup from "../../_components/AcceptDealPopup";

function getStatusLabel(status: CreateNegotiationResponse["status"]) {
  switch (status) {
    case "N":
      return "Negotiating";
    case "R":
      return "Terminated";
    case "A":
      return "Traded";
    case "C":
      return "Consideration Confirmed";
    case "E":
      return "Expired";
    default:
      return "-";
  }
}

function getDealTypeLabel(type?: string) {
  if (!type) return "-";
  return type === "D" ? "Direct" : "Brokered";
}

function DealProposerTable({
  data,
  loading,
  onClick,
}: {
  data: CreateNegotiationResponse[];
  loading?: boolean;
  onClick?: (item: CreateNegotiationResponse) => void;
}) {
  return (
    <div>
      <UniversalTable<CreateNegotiationResponse>
        initialPageSize={10}
        isLoading={loading}
        data={data}
        onRowClickAction={onClick}
        fields={[
          { key: "tradeNumber", label: "Trade Number" },
          { key: "isin", label: "ISIN" },
          // Note: Issue Description not available in CreateNegotiationResponse interface
          // { key: "issueDescription", label: "Issue Description" },
          // Note: Access not available in CreateNegotiationResponse interface
          // { key: "access", label: "Access" },
          // Note: Need to determine buyer/seller from buySell flag and map accordingly
          {
            key: "buyerParticipant",
            label: "Buyer Participant",
            cell: (row) => row.initAeCode,
            // row.buySell === "B" ? row.initAeCode : row.respAeCode,
          },
          {
            key: "buyerClient",
            label: "Buyer Client",
            cell: (row) => row.initClientCode,
            // row.buySell === "B" ? row.initClientCode : row.respClientCode,
          },
          {
            key: "sellerParticipant",
            label: "Seller Participant",
            cell: (row) => row.respAeCode,
            // row.buySell === "S" ? row.initAeCode : row.respAeCode,
          },
          {
            key: "sellerClient",
            label: "Seller Client",
            cell: (row) => row.respClientCode,
            // row.buySell === "S" ? row.initClientCode : row.respClientCode,
          },
          { key: "acceptedValue", label: "Value (Crores)" },
          { key: "acceptedQuantity", label: "Quantity" },
          { key: "acceptedYield", label: "Yield" },
          { key: "acceptedYieldType", label: "Yield Type" },
          { key: "acceptedPrice", label: "Price" },
          { key: "acceptedAccruedInterest", label: "Accrued Interest" },
          {
            key: "acceptedConsideration",
            label: "Consideration without stamp duty",
            cell(row) {
              return (
                <div className="flex items-center gap-3">
                  {row.acceptedConsideration}
                  {!row.confirmStatus && (
                    <DealConfirmPopup data={row}>
                      <Edit
                        className="bg-primary p-[3px] rounded-4xl text-white cursor-pointer"
                        size={17}
                      />
                    </DealConfirmPopup>
                  )}
                  {row.confirmStatus == "PC" && (
                    <div className="flex flex-row gap-2">
                      <AcceptDealPopup data={row} status="PC">
                        <Check
                          className="bg-green-500 p-[3px] rounded-4xl text-white cursor-pointer"
                          size={17}
                        />
                      </AcceptDealPopup>
                      <AcceptDealPopup data={row} status="PR">
                        <X
                          className="bg-red-500 p-[3px] rounded-4xl text-white cursor-pointer"
                          size={17}
                        />
                      </AcceptDealPopup>
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            key: "status",
            label: "Status",
            cell: (row) => getStatusLabel(row.status),
          },
          { key: "acceptedQuoteTime", label: "Trade Time" },
          { key: "acceptedSettlementDate", label: "Settlement Date" },
          {
            key: "initDealType",
            label: "Initiator Deal Type",
            cell: (row) => getDealTypeLabel(row.initDealType),
          },
          {
            key: "respDealType",
            label: "Counter Party Deal Type",
            cell: (row) => getDealTypeLabel(row.respDealType),
          },
          { key: "rfqNumber", label: "RFQ Number" },
          { key: "id", label: "Thread Id" },
          {
            key: "buyerUser",
            label: "Buyer User",
            cell: (row) => row.initLoginId,
            // row.buySell === "B" ? row.initLoginId : row.respLoginId,
          },
          {
            key: "sellerUser",
            label: "Seller User",
            cell: (row) => row.respLoginId,
            // row.buySell === "S" ? row.initLoginId : row.respLoginId,
          },
          {
            key: "createdAt",
            label: "Created At",
            cell: (row) => {
              return row.createdAt
                ? dateTimeUtils.formatDateTime(
                    row.createdAt,
                    "DD MMM YYYY hh:mm AA"
                  )
                : "--";
            },
          },
          {
            key: "updatedAt",
            label: "Updated At",
            cell: (row) => {
              return row.updatedAt
                ? dateTimeUtils.formatDateTime(
                    row.updatedAt,
                    "DD MMM YYYY hh:mm AA"
                  )
                : "--";
            },
          },
        ]}
      />
    </div>
  );
}

export default DealProposerTable;
