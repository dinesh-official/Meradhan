"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { JsonView, defaultStyles } from "react-json-view-lite";
import { FaSpinner } from "react-icons/fa";

const PAGE_SIZE = 20;

function KraLogsView({ id }: { id: number }) {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const profileApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller
  );
  const { data, isLoading } = useQuery({
    queryKey: ["KycKraLogsView", id],
    queryFn: async () => {
      const { responseData } = await profileApi.getKycKraDataById(id);
      return responseData;
    },
  });

  const sortedLogs = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return [...data].sort((a, b) => {
      const tA = a.reqTime ? new Date(a.reqTime).getTime() : 0;
      const tB = b.reqTime ? new Date(b.reqTime).getTime() : 0;
      return tB - tA;
    });
  }, [data]);

  const visibleLogs = sortedLogs.slice(0, displayCount);
  const hasMore = displayCount < sortedLogs.length;

  if (!isLoading && sortedLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <span className="text-gray-400 text-2xl mb-2">No KRA logs found</span>
        <span className="text-gray-400">Try refreshing or check back later.</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pb-2 mb-2 flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight">KRA Logs</h3>
        {isLoading && <FaSpinner className="animate-spin text-xl ml-2" />}
      </div>
      <div className="space-y-2">
        {!isLoading &&
          visibleLogs.map((log, index: number) => (
            <Collapsible
              key={index}
              open={openIndex === index}
              onOpenChange={(open) => setOpenIndex(open ? index : null)}
            >
              <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-gray-50 cursor-pointer">
                    {openIndex === index ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      {log.reqTime
                        ? dateTimeUtils.formatDateTime(
                          new Date(log.reqTime),
                          "DD/MM/YYYY HH:mm:ss"
                        )
                        : "—"}
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${log.stage === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {log.stage ?? "—"}
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-gray-200 px-4 py-3 space-y-3 bg-gray-50/50">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Request
                      </span>
                      <div className="mt-1 overflow-auto rounded border border-gray-200 bg-white p-2 text-sm">
                        <JsonView
                          data={log.requestData || {}}
                          style={defaultStyles}
                          shouldExpandNode={() => false}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Response
                      </span>
                      <div className="mt-1 overflow-auto rounded border border-gray-200 bg-white p-2 text-sm">
                        <JsonView
                          data={log.responseData || {}}
                          style={defaultStyles}
                          shouldExpandNode={() => false}
                        />
                      </div>
                    </div>
                    {log.error && (
                      <div>
                        <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                          Error
                        </span>
                        <div className="mt-1 overflow-auto rounded border border-red-200 bg-red-50/50 p-2 text-sm">
                          <JsonView
                            data={
                              typeof log.error === "object"
                                ? log.error
                                : { message: String(log.error) }
                            }
                            style={defaultStyles}
                            shouldExpandNode={() => false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        {hasMore && !isLoading && (
          <div className="pt-2 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDisplayCount((c) => Math.min(c + PAGE_SIZE, sortedLogs.length))
              }
            >
              Load more ({sortedLogs.length - displayCount} remaining)
            </Button>
          </div>
        )}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-40">
            <FaSpinner className="animate-spin text-blue-500 text-3xl mb-2" />
            <span className="text-blue-500">Loading KRA logs...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default KraLogsView;
