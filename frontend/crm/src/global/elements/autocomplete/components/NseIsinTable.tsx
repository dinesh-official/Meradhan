"use client";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { formatNumberTS } from "@/global/utils/formate";
import { NSE_ISIN_DATA } from "@root/apiGateway";

function NseIsinTable({
  data,
  loading,
  onClickRow
}: {
  data: NSE_ISIN_DATA[];
  loading: boolean;
  onClickRow?: (e: NSE_ISIN_DATA) => void;
}) {
  return (
    <UniversalTable<NSE_ISIN_DATA>
      initialPageSize={300}
      isLoading={loading}
      data={data}
      
      onRowClickAction={(row) => onClickRow?.(row)}
      fields={[
        { key: "symbol", label: "Symbol" },

        {
          key: "maturityDate",
          label: "Maturity Date",
          type: "date",
        },
        { key: "couponRate", label: "Coupon Rate" },
        {
          key: "faceValue", label: "Face Value",
         cell(row) {
             return formatNumberTS(row.faceValue);
         }, 
        },
        { key: "issueCategory", label: "Issue Category" },
        { key: "listed", label: "Listed" },
        {
          key: "issuer",
          label: "Issuer",
        },
        {
          key: "status",
          label: "Status",
        },
        { key: "description", label: "Description" },
      ]}
      searchColumnKey="name"
    />
  );
}

export default NseIsinTable;
