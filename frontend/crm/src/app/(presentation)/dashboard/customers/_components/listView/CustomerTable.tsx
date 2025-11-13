"use client";

import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { CustomerProfile } from "@root/apiGateway";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import CustomerTableActions from "./actions/CustomerTableActions";

interface UsersTableProps {
  data: CustomerProfile[];
  pageSize?: number;
  isLoading?: boolean;
}

function CustomerTable({ data, pageSize = 10, isLoading }: UsersTableProps) {
  return (
    <UniversalTable<CustomerProfile>
      initialPageSize={pageSize}
      data={data}
      isLoading={isLoading}
      fields={[
        {
          key: "name",
          label: "Name",
          cell: (row) => (
            <div className="flex flex-col">
              <span className="font-medium">
                {[
                  row.firstName?.trim(),
                  row.middleName?.trim(),
                  row.lastName?.trim(),
                ]
                  .filter(Boolean) // remove undefined or empty names
                  .join(" ")}
              </span>

              {row.userName && (
                <span className="text-muted-foreground text-xs">
                  @{row.userName}
                </span>
              )}
            </div>
          ),
        },
        {
          key: "email",
          label: "Email & Phone",
          cell: (row) => (
            <div className="flex flex-col">
              <span className="lowercase">{row.emailAddress}</span>
              <span className="text-muted-foreground text-xs">
                {row.phoneNo ?? "-"}
              </span>
            </div>
          ),
        },
        { key: "panCard.panCardNo", label: "PAN Number" },
        {
          key: "kycStatus",
          label: "KYC",
          cell: (row) => <StatusBadge value={row.kycStatus} />,
        },
        {
          key: "status",
          label: "Status",
          cell: (row) => (
            <StatusBadge value={row.utility?.accountStatus ?? "UNKNOWN"} />
          ),
        },
        // {
        //   key: "totalInvestment",
        //   label: "Total Investment",
        //   type: "currency",
        //   currency: "INR",
        // },
        {
          key: "createdAt",
          label: "Created/Update",
          cell: (row) => (
            <div className="">
              <p>
                
                {dateTimeUtils.formatDateTime(
                  row.updatedAt,
                  "DD MMM YYYY hh:mm AA"
                )}
              </p>
              <p  className="text-gray-500 text-xs" >
                {dateTimeUtils.formatDateTime(
                  row.createdAt,
                  "DD MMM YYYY hh:mm AA"
                )}
              </p>
            </div>
          ),
        },

        {
          key: "actions",
          label: "Action",
          stickyRight: true, // UniversalTable will add the sticky wrapper
          sortable: false,
          cell: (row) => <CustomerTableActions profile={row} />,
        },
      ]}
      searchColumnKey="name"
    />
  );
}

export default CustomerTable;
