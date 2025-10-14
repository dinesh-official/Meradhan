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
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";
import StatusBadge from "@/global/elements/wrapper/StatusBadge";

type Role = "admin" | "manager" | "sales" | "viewer" | "auditor";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  avatar?: string;
  lastLogin?: string | Date;
  role: Role;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
};

interface UsersTableProps {
  data: UserRow[];
  pageSize?: number;
  onViewUser?: (user: UserRow) => void;
  onEditUser?: (user: UserRow) => void;
}

function UsersTable({
  data,
  pageSize = 10,
  onViewUser,
  onEditUser,
}: UsersTableProps) {
  return (
    <UniversalTable<UserRow>
      data={data}
      initialPageSize={pageSize}
      fields={[
        { key: "name", label: "Name" },
        {
          key: "email",
          label: "Email",
          cell: (row) => <span className="lowercase">{row.email}</span>,
        },
        { key: "phoneNo", label: "Phone" },
        {
          key: "lastLogin",
          label: "Last Login",
          type: "date",
        },
        {
          key: "role",
          label: "Role",
          cell: (row) => <StatusBadge value={row.role} />,
        },
        { key: "createdBy", label: "Created By" },
        { key: "createdAt", label: "Created At", type: "date" },
        { key: "updatedAt", label: "Updated At", type: "date" },

        // Actions (sticky)
        {
          key: "actions",
          label: "Action",
          stickyRight: true,
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
                  Copy User ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log("View", row.id)}>
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Edit", row.id)}>
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        },
      ]}
    />
  );
}

export default UsersTable;
