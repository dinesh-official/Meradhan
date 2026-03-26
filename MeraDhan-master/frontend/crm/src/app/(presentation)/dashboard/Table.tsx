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
const customersMock: Customer[] = [
  {
    id: "1",
    name: "Working Bapari",
    email: "sourav0w@gmail.com",
    phone: "9382156026",
    company: "Alpha Corp",
    panNumber: "WORBP8123A",
    kycStatus: "Pending",
    status: "Active",
    totalInvestment: 0,
    leadId: "LD4001",
    username: "working.b",
    dematAccount: "DEMAT1001",
    relationshipManager: "Rohan Singh",
    createdAt: "3 months ago",
    updatedAt: "19 days ago",
  },
  {
    id: "2",
    name: "Vikas Kukreja",
    email: "vikas.kukreja83@gmail.com",
    phone: "9910286723",
    company: "Beta Traders",
    panNumber: "VIKPK6139M",
    kycStatus: "Pending",
    status: "Active",
    totalInvestment: 0,
    leadId: "LD4002",
    username: "vikas.k",
    dematAccount: "DEMAT1002",
    relationshipManager: "Amit Yadav",
    createdAt: "3 months ago",
    updatedAt: "3 months ago",
  },
  {
    id: "3",
    name: "Neha Sharma",
    email: "neha.sharma@example.com",
    phone: "9876543210",
    company: "Zenith Finserv",
    panNumber: "NEXPS4432Q",
    kycStatus: "Verified",
    status: "Active",
    totalInvestment: 250000,
    leadId: "LD4003",
    username: "neha.s",
    dematAccount: "DEMAT1003",
    relationshipManager: "Rohan Singh",
    createdAt: "5 months ago",
    updatedAt: "2 months ago",
  },
  {
    id: "4",
    name: "Arjun Patel",
    email: "arjun.patel@example.com",
    phone: "9898123456",
    company: "Gamma Capital",
    panNumber: "ARJPP9834T",
    kycStatus: "Verified",
    status: "Active",
    totalInvestment: 420000,
    leadId: "LD4004",
    username: "arjunp",
    dematAccount: "DEMAT1004",
    relationshipManager: "Nisha Gupta",
    createdAt: "1 year ago",
    updatedAt: "4 months ago",
  },
];
function Table() {
  return (
    <UniversalTable<Customer>
      initialPageSize={10}
      data={[...customersMock, ...customersMock, ...customersMock]}
      fields={[
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
        { key: "company", label: "Company" },
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

                <DropdownMenuItem onClick={() => {}}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
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

export default Table;
