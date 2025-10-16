"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ASSETS_URL } from "@/global/constants/domains";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import UserRoleBadge from "@/global/elements/wrapper/badges/UserRoleBadge";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { CrmUsersProfile } from "@root/apiGateway";
import UserTableActions from "./actions/UserTableActions";
interface UsersTableProps {
  data: CrmUsersProfile[];
  pageSize?: number;
  onViewUser?: (user: CrmUsersProfile) => void;
  onEditUser?: (user: CrmUsersProfile) => void;
  isLoading?: boolean;
}
function UsersTable({ data, pageSize, isLoading }: UsersTableProps) {
  return (
    <UniversalTable<CrmUsersProfile>
      data={data}
      initialPageSize={pageSize}
      isLoading={isLoading}
      fields={[
        {
          key: "name",
          label: "Name",

          cell: (row) => {
            return (
              <div className="flex  justify-start gap-4 items-center">
                <Avatar>
                  <AvatarImage src={ASSETS_URL + "/" + row.avatar} />
                  <AvatarFallback></AvatarFallback>
                </Avatar>
                <p className="text-md">{row.name}</p>
              </div>
            );
          },
        },
        {
          key: "email",
          label: "Email",
          cell: (row) => <span className="lowercase">{row.email}</span>,
        },
        { key: "phoneNo", label: "Phone" },
        {
          key: "accountStatus",
          label: "Status",
          cell: (row) => <StatusBadge value={row.accountStatus} />,
        },

        {
          key: "lastLogin",
          label: "Last Login",
          cell: (row) => {
            return (
              <p>
                {!row.lastLogin
                  ? "NO Login"
                  : dateTimeUtils.formatDateTime(
                      row.lastLogin,
                      "DD MMMM YYYY hh:mm AA"
                    )}
              </p>
            );
          },
        },
        {
          key: "role",
          label: "Role",
          cell: (row) => <UserRoleBadge value={row.role} />,
        },
        // { key: "createdBy", label: "Created By" },
        { key: "createdAt", label: "Created At", type: "date" },
        { key: "updatedAt", label: "Updated At", type: "date" },

        // Actions (sticky)
        {
          key: "actions",
          label: "Action",
          stickyRight: true,
          sortable: false,
          cell: (row) => <UserTableActions profile={row} />,
        },
      ]}
    />
  );
}

export default UsersTable;
