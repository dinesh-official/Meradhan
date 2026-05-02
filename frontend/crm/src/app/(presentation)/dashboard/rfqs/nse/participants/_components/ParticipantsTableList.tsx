"use client";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import WorkflowStatusBadge from "@/global/elements/wrapper/badges/WrokflowStatusBadge";
import { ParticipantData } from "@root/apiGateway";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ParticipantRowActions } from "./ParticipantRowActions";

function ParticipantsTableList({
  data,
  isLoading,
}: {
  data: ParticipantData[];
  isLoading?: boolean;
}) {
  const router = useRouter();

  return (
    <UniversalTable<ParticipantData>
      initialPageSize={100}
      data={data}
      isLoading={isLoading}
      getRowIdAction={(row) => String(row.id)}
      onRowClickAction={(row) => {
        const href = `/dashboard/tools/cbrics-manager?participantId=${row.id}` as Route;
        router.push(href);
      }}
      fields={[
        {
          key: "loginId",
          label: "ID",
          cell: (row) => {
            return <p>{row.id}</p>;
          },
        },
        { key: "loginId", label: "Login Id" },

        { key: "firstName", label: "Name" },
        {
          key: "workflowStatus",
          label: "Workflow Status",
          cell: (row) => {
            return <WorkflowStatusBadge statusCode={row.workflowStatus} />;
          },
        },

        {
          key: "id",
          label: "Email List",
          cell: (row) => {
            return (
              <div>
                {row.emailList.map((e, index) => {
                  return <p key={e + index}>{e}</p>;
                })}
              </div>
            );
          },
        },
        {
          key: "id",
          label: "Mobile List",
          cell: (row) => {
            return (
              <div>
                {row.mobileList.map((e, index) => {
                  return <p key={e + index}>{e}</p>;
                })}
              </div>
            );
          },
        },

        { key: "panNo", label: "Pan No" },
        {
          key: "panVerStatus",
          label: "Pan VerStatus",
          cell: (row) => {
            return <WorkflowStatusBadge statusCode={row.panVerStatus} />;
          },
        },
        { key: "panVerRemarks", label: "Pan VerRemarks", type: "datetime" },
        { key: "remarks", label: "Remarks", type: "datetime" },
        {
          key: "createdAt",
          label: "Created At",
          cell: (row) => {
            const data = row as ParticipantData & {
              createdAt?: string | Date;
              updatedAt?: string | Date;
            };
            return data.createdAt
              ? dateTimeUtils.formatDateTime(
                  data.createdAt,
                  "DD MMM YYYY hh:mm AA"
                )
              : "--";
          },
        },
        {
          key: "updatedAt",
          label: "Updated At",
          cell: (row) => {
            const data = row as ParticipantData & {
              createdAt?: string | Date;
              updatedAt?: string | Date;
            };
            return data.updatedAt
              ? dateTimeUtils.formatDateTime(
                  data.updatedAt,
                  "DD MMM YYYY hh:mm AA"
                )
              : "--";
          },
        },
        {
          key: "actions",
          label: "Action",
          stickyRight: true,
          sortable: false,
          cell: (row) => <ParticipantRowActions row={row} />,
        },
      ]}
    />
  );
}

export default ParticipantsTableList;
