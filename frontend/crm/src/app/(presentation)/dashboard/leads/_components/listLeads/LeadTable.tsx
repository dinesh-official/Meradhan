"use client";

import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { NewLeadPayload } from "@root/apiGateway";
// import LeadTableActions from "./actions/LeadTableActions";



interface LeadsTableProps {
  data: NewLeadPayload[];
  pageSize?: number;
  isLoading?: boolean;
}

function LeadTable({ data, pageSize = 10, isLoading }: LeadsTableProps) {
  return (
    <UniversalTable<NewLeadPayload>
      initialPageSize={pageSize}
      data={data}
      isLoading={isLoading}
      fields={[
        {
          key: "fullName",
          label: "Name",
          cell: (row) => (
            <div className="flex flex-col">
              <span className="font-medium">{row.fullName?.trim()}</span>
              {row.companyName && (
                <span className="text-xs text-muted-foreground">
                  {row.companyName}
                </span>
              )}
            </div>
          ),
        },
        {
          key: "emailAddress",
          label: "Email & Phone",
          cell: (row) => (
            <div className="flex flex-col">
              <span className="lowercase">{row.emailAddress}</span>
              <span className="text-xs text-muted-foreground">
                {row.phoneNo ?? "-"}
              </span>
            </div>
          ),
        },
        {
          key: "leadSource",
          label: "Source",
        },
        {
          key: "bondType",
          label: "Bond Type",
        },
        {
          key: "status",
          label: "Status",
          cell: (row) => <StatusBadge value={row.status} />,
        },
        {
          key: "exInvestmentAmount",
          label: "Expected Investment",
          cell: (row) => (
            <span>
              {typeof row.exInvestmentAmount === "number"
                ? new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(row.exInvestmentAmount)
                : "-"}
            </span>
          ),
        },
        {
          key: "createdAt",
          label: "Created",
          cell: (row) => (
            <span>
              {dateTimeUtils.formatDateTime(
                row.createdAt,
                "DD MMMM YYYY hh:mm AA"
              )}
            </span>
          ),
        },
        {
          key: "updatedAt",
          label: "Updated",
          cell: (row) => (
            <span>
              {dateTimeUtils.formatDateTime(
                row.updatedAt,
                "DD MMMM YYYY hh:mm AA"
              )}
            </span>
          ),
        },
        // {
        //   key: "actions",
        //   label: "Action",
        //   stickyRight: true,
        //   sortable: false,
        //   cell: (row) => <LeadTableActions lead={row} />,
        // },
      ]}
      searchColumnKey="fullName"
    />
  );
}

export default LeadTable;
