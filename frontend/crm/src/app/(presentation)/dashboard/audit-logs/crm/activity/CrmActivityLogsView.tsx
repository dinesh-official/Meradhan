"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import ActivityLogsCardHeaderFilters from "./_components/ActivityLogsCardHeaderFilters";

function CrmActivityLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/server/crm/tracking/list?page=${pageNum}&limit=10`
      );
      const json = await res.json();

      setLogs(json.responseData.data || []);
      setPage(json.responseData.meta.page || 1);
      setTotalPages(json.responseData.meta.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <Card>
      <ActivityLogsCardHeaderFilters />
      <CardContent>
        {loading ? (
          <div className="text-center py-6 text-muted-foreground">
            Loading...
          </div>
        ) : (
          <Table data={logs} />
        )}
      </CardContent>
      <CardPagination
        onClick={(newPage) => setPage(newPage)}
        page={page}
        totalPages={totalPages}
      />
    </Card>
  );
}

export default CrmActivityLogsView;

// ============= Table Component =============
export function Table({ data = [] }: { data: any[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!data.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No records found
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b bg-muted/50">
          <th className="p-2 text-left w-16">ID</th>
          <th className="p-2 text-left">Type</th>
          <th className="p-2 text-left">URL</th>
          <th className="p-2 text-left">User ID</th>
          <th className="p-2 text-left">Created At</th>
          <th className="p-2 text-left w-24">Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((log) => (
          <>
            <tr
              key={log.id}
              className="border-b hover:bg-muted/30 cursor-pointer"
              onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            >
              <td className="p-2">{log.id}</td>
              <td className="p-2">{log.type}</td>
              <td className="p-2">{log.url}</td>
              <td className="p-2">{log.userId || "-"}</td>
              <td className="p-2">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="p-2 text-blue-600 hover:underline">
                {expanded === log.id ? "Hide" : "View"}
              </td>
            </tr>

            {expanded === log.id && (
              <tr className="bg-muted/10">
                <td colSpan={6} className="p-3">
                  <DetailedView data={log.data} />
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}

// ============= Expanded Row View =============
function DetailedView({ data }: { data: any }) {
  if (!data) return null;

  const location = data.location
    ? `${data.location.city || ""}, ${data.location.country || ""}`
    : "-";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
      <div>
        <span className="font-medium">IP:</span> {data.ip || "-"}
      </div>
      <div>
        <span className="font-medium">Location:</span> {location}
      </div>
      <div>
        <span className="font-medium">Clicks:</span> {data.clicks ?? "-"}
      </div>
      <div>
        <span className="font-medium">Scroll %:</span> {data.scrollPercent ?? "-"}
      </div>
      <div>
        <span className="font-medium">Referrer:</span> {data.referrer || "-"}
      </div>
      <div>
        <span className="font-medium">Session Time:</span>{" "}
        {data.duration ? `${data.duration}s` : "-"}
      </div>
      <div className="col-span-2 md:col-span-3">
        <span className="font-medium">Raw JSON:</span>
        <pre className="bg-muted/30 p-2 rounded-md text-xs overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
