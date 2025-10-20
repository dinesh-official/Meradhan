"use client";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { AuditLogData } from "@root/apiGateway";

function AuditLogsTable({
  data,
  isLoading,
}: {
  data: AuditLogData[];
  isLoading: boolean;
}) {
  return (
    <UniversalTable<AuditLogData>
      initialPageSize={10}
      data={data}
      isLoading={isLoading}
      fields={[
        {
          key: "id",
          label: "User Information",
          cell: (row) => {
            const user = row.data?.user;
            if (!user) return null;

            return (
              <div className="text-xs">
                {user.name ? (
                  <p className="font-medium">{user.name}</p>
                ) : (
                  "--------"
                )}
                {user.email && <p>{user.email}</p>}
                {user.role && <small>{user.role}</small>}
              </div>
            );
          },
        },
        {
          key: "url",
          label: "Url & Interactions",
          cell: (row) => {
            const { url, maxScrollPercent, clicks } = row.data || {};
            if (!url && !maxScrollPercent && !clicks) return null;

            return (
              <div className="text-xs">
                {url && <p className="font-medium">{url}</p>}
                {typeof maxScrollPercent === "number" && (
                  <p>{maxScrollPercent} % Scroll</p>
                )}
                {typeof clicks === "number" && <p>{clicks} Clicks</p>}
              </div>
            );
          },
        },
        {
          key: "type",
          label: "Activity Type",
          cell: (row) => {
            const { type, data } = row;
            const reason = data?.reason;

            if (!type && !reason) return null;

            return (
              <div className="text-xs">
                {type && <p className="font-medium">{type.toUpperCase()}</p>}
                {reason && <p>{reason}</p>}
              </div>
            );
          },
        },
        {
          key: "data.ipData",
          label: "IP & Location",
          cell: (row) => {
            const ipData = row.data?.ipData;
            const screen = row.data?.screen;

            if (!ipData && !screen) return null;

            return (
              <div className="text-xs">
                {ipData?.org ? <p>{ipData.org}</p> : <p>--------</p>}
                {ipData?.ip && (
                  <p>
                    {ipData.ip} - {ipData.city}
                  </p>
                )}
              </div>
            );
          },
        },
        {
          key: "data.system",
          label: "System Info",
          cell: (row) => {
            const { os, browser, screen } = row.data || {};
            if (!os && !browser && !screen) return null;

            return (
              <div className="text-xs">
                {os && <p>{os}</p>}
                {browser && <p>{browser.split(" ")?.[0]}</p>}
                {screen?.width && screen?.height && (
                  <p>
                    Screen: {screen.width} x {screen.height}
                  </p>
                )}
              </div>
            );
          },
        },
        {
          key: "createdAt",
          label: "Time & Duration",
          type: "datetime",
          cell: (row) => {
            const { createdAt, data } = row;
            if (!createdAt && !data?.duration) return null;

            return (
              <div className="text-xs">
                {createdAt && (
                  <p className="font-medium">
                    {dateTimeUtils.formatDateTime(
                      createdAt,
                      "DD/MM/YYYY HH:mm:ss"
                    )}
                  </p>
                )}
                {data?.duration && <p>Page Duration: {data.duration} Sec</p>}
              </div>
            );
          },
        },
      ]}
      searchColumnKey="name"
    />
  );
}

export default AuditLogsTable;
