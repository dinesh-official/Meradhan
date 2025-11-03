"use client";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import WorkflowStatusBadge from "@/global/elements/wrapper/badges/WrokflowStatusBadge";
import { ParticipantData } from "@root/apiGateway";

function ParticipantsTableList({
  data,
  isLoading,
}: {
  data: ParticipantData[];
  isLoading?: boolean;
}) {
  return (
    <UniversalTable<ParticipantData>
      initialPageSize={100}
      data={data}
      isLoading={isLoading}
      fields={[
        { key: "loginId", label: "ID",cell: (row) => {
          return <p>{ row.id}</p>
          }, },
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
          key: "actions",
          label: "Action",
          stickyRight: true, // UniversalTable will add the sticky wrapper
          sortable: false,
          cell: () => <></>,
        },
      ]}
    />
  );
}

export default ParticipantsTableList;
