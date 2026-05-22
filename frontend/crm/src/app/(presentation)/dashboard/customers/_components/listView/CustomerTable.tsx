"use client";

import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { CustomerProfile } from "@root/apiGateway";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import CustomerTableActions from "./actions/CustomerTableActions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2 } from "lucide-react";

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
          cell: (row) => {
            const isActive = row.utility?.accountStatus === "ACTIVE";
            return (
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {row.utility?.accountStatus ?? "Unknown"}
                  </TooltipContent>
                </Tooltip>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {[row.firstName?.trim(), row.middleName?.trim(), row.lastName?.trim()]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                  {row.userName && (
                    <span className="text-muted-foreground text-xs">@{row.userName}</span>
                  )}
                </div>
              </div>
            );
          },
        },
        {
          key: "email",
          label: "Email & Phone",
          cell: (row) => (
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-sm lowercase">
                {row.emailAddress}
                {row.utility?.isEmailVerified && (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                )}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {row.phoneNo ?? "—"}
                {row.phoneNo && row.utility?.isPhoneVerified && (
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                )}
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
        // Commented temporarily to hide the KRA status column for Users.
        // TODO: Uncomment when KRA status need 
        // {
        //   key: "kraStatus",
        //   label: "KRA",
        //   cell: (row) => (
        //     <StatusBadge value={row.kraStatus || "Not Started"} />
        //   ),
        // },
        {
          key: "status",
          label: "Status",
          cell: (row) => (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">
                  <StatusBadge value={row.kycStatus} />
                </span>
              </TooltipTrigger>
              <TooltipContent className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">KYC</span>
                  <span className="font-medium">{row.kycStatus || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">KRA</span>
                  <span className="font-medium">{row.kraStatus || "Not Started"}</span>
                </div>
              </TooltipContent>
            </Tooltip>
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
              <p className="text-gray-500 text-xs" >
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
