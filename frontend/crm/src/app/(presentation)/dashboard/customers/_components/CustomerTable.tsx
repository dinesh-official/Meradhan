"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { MoreHorizontal } from "lucide-react";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  panNumber?: string;
  kycStatus: "Pending" | "Verified" | "Rejected";
  status: "Active" | "Inactive";
  totalInvestment: number;
  leadId?: string;
  username?: string;
  dematAccount?: string;
  relationshipManager?: string;
  createdAt: string;
  updatedAt: string;
};

interface UsersTableProps {
  data: Customer[];
  pageSize?: number;
  onViewUser?: (user: Customer) => void;
  onEditUser?: (user: Customer) => void;
}

function CustomerTable({ data, pageSize = 10 }:UsersTableProps) {
  return (
    <UniversalTable<Customer>
      initialPageSize={pageSize}
      data={data}
      fields={[
        { key: "username", label: "UserName" },
        { key: "name", label: "Name" },
        {
          key: "email",
          label: "Email & Phone",
          cell: (row) => (
            <div className="flex flex-col">
              <span className="lowercase">{row.email}</span>
              <span className="text-xs text-muted-foreground">
                {row.phone ?? "-"}
              </span>
            </div>
          ),
        },
        { key: "panNumber", label: "PAN Number" },
        {
          key: "kycStatus",
          label: "KYC",
          cell: (row) => <StatusBadge value={row.kycStatus} />,
        },
        {
          key: "status",
          label: "Status",
          cell: (row) => <StatusBadge value={row.status} />,
        },
        {
          key: "totalInvestment",
          label: "Total Investment",
          type: "currency",
          currency: "INR",
        },
        { key: "createdAt", label: "Created" },
        { key: "updatedAt", label: "Updated" },

        {
          key: "actions",
          label: "Action",
          stickyRight: true, // UniversalTable will add the sticky wrapper
          sortable: false,
          cell: (row) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(row.id)}
                >
                  Copy Customer ID
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => console.log("View", row.id)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Edit", row.id)}>
                  Edit Customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        },
      ]}
      searchColumnKey="name"
    />
  );
}

export default CustomerTable;
