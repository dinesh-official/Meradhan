"use client";

import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { PartnershipPayload } from "@root/apiGateway";
import PartnershipTableActions from "./actions/partnershipTableAction";
import LeadStatusBadge from "@/global/elements/wrapper/badges/LeadStatusBadge";

interface PartnershipsTableProps {
  data: PartnershipPayload[];
  pageSize?: number;
  isLoading?: boolean;
}

function PartnershipTable({
  data,
  pageSize = 10,
  isLoading,
}: PartnershipsTableProps) {
  return (
    <UniversalTable<PartnershipPayload>
      initialPageSize={pageSize}
      data={data}
      isLoading={isLoading}
      fields={[
        {
          key: "organizationName",
          label: "Organization",
          cell: (row) => (
            <div className="flex flex-col">
              <span className="font-medium">{row.organizationName?.trim()}</span>
              <span className="text-xs text-muted-foreground">
                {row.organizationType}
              </span>
            </div>
          ),
        },
        {
          key: "fullName",
          label: "Contact Person",
          cell: (row) => (
            <div className="flex flex-col">
              <span className="font-medium">{row.fullName?.trim()}</span>
              <span className="text-xs text-muted-foreground">
                {row.designation}
              </span>
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
                {row.mobileNumber ?? "-"}
              </span>
            </div>
          ),
        },
        {
          key: "city",
          label: "Location",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.city}</span>
              <span className="text-xs text-muted-foreground">{row.state}</span>
            </div>
          ),
        },
        {
          key: "partnershipModel",
          label: "Partnership Model",
          cell: (row) => (
            <span className="capitalize">
              {row.partnershipModel?.replace("-", " / ")}
            </span>
          ),
        },
        {
          key: "status",
          label: "Status",
          cell: (row) => <LeadStatusBadge value={row.status} />,
        },
        {
          key: "createdAt",
          label: "Created/Updated",
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
          cell: (row) => <PartnershipTableActions partnership={row} />,
        },
      ]}
      searchColumnKey="organizationName"
    />
  );
}

export default PartnershipTable;

