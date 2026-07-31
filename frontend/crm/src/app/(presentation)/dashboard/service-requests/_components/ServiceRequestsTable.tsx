"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import type { CrmServiceRequestRow } from "@root/apiGateway";
import ServiceRequestsTableActions from "./ServiceRequestsTableActions";

export default function ServiceRequestsTable({
  rows,
  closeMutation,
  rejectMutation,
}: {
  rows: CrmServiceRequestRow[];
  closeMutation: Parameters<typeof ServiceRequestsTableActions>[0]["closeMutation"];
  rejectMutation: Parameters<typeof ServiceRequestsTableActions>[0]["rejectMutation"];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Remark</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead>Processed</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const name = [row.customer.firstName, row.customer.middleName, row.customer.lastName]
            .filter(Boolean)
            .join(" ");
          return (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell>{row.customer.phoneNo ?? "—"}</TableCell>
              <TableCell>{row.customer.emailAddress}</TableCell>
              <TableCell>Account Closure</TableCell>
              <TableCell>{row.reason?.text ?? "—"}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {row.reasonRemark ?? "—"}
              </TableCell>
              <TableCell>
                <StatusBadge value={row.status} />
              </TableCell>
              <TableCell>
                {dateTimeUtils.formatDateTime(row.createdAt, "DD MMM YYYY")}
              </TableCell>
              <TableCell>
                {row.processedAt
                  ? `${dateTimeUtils.formatDateTime(row.processedAt, "DD MMM YYYY")}${row.processedByName ? ` · ${row.processedByName}` : ""}`
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <ServiceRequestsTableActions
                  row={row}
                  closeMutation={closeMutation}
                  rejectMutation={rejectMutation}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
