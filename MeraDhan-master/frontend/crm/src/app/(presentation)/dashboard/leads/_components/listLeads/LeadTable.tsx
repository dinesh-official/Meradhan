"use client";

import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { NewLeadPayload } from "@root/apiGateway";
import LeadTableActions from "./actions/leadTableAction";
import LeadStatusBadge from "@/global/elements/wrapper/badges/LeadStatusBadge";
import SourceBadge from "@/global/elements/wrapper/badges/SourceBadge";

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
          key: "bondType",
          label: "Bond Type",
          cell(row) {
            return <span>{row.bondType.split("_").join(" ")}</span>;
          },
        },
        {
          key: "status",
          label: "Status",
          cell: (row) => <LeadStatusBadge value={row.status} />,
        },
        {
          key: "leadSource",
          label: "Lead Source",
          cell: (row) => (
            <SourceBadge value={row.leadSource.replaceAll("_", " ")} />
          ),
        },
        {
          key: "exInvestmentAmount",
          label: "Exp. Investment",
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
          label: "Created/Update",
          cell: (row) => (
            <div className="flex flex-col">
              <span className="text-sm">
                {dateTimeUtils.formatDateTime(
                  row.createdAt,
                  "DD MMMM YYYY hh:mm AA"
                )}
              </span>
              <span className="text-xs text-gray-700">
                {dateTimeUtils.formatDateTime(
                  row.updatedAt,
                  "DD MMMM YYYY hh:mm AA"
                )}
              </span>
            </div>
          ),
        },

        {
          key: "actions",
          label: "Action",
          stickyRight: true,
          sortable: false,
          cell: (row) => <LeadTableActions lead={row} />,
        },
      ]}
      searchColumnKey="fullName"
    />
  );
}

export default LeadTable;
