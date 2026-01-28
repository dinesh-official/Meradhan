"use client";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { FaSpinner } from "react-icons/fa";
import { JsonView, defaultStyles } from 'react-json-view-lite';

// Dynamically import ReactJson to avoid SSR issues


function KraLogsView({ id }: { id: number }) {
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

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <span className="text-gray-400 text-2xl mb-2">No KRA logs found</span>
        <span className="text-gray-400">
          Try refreshing or check back later.
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className=" pb-2 mb-2  flex items-center justify-between">
        <h3 className="text-2xl font-bold  tracking-tight">KRA Logs</h3>
        {isLoading && <FaSpinner className="animate-spin  text-xl ml-2" />}
      </div>
      <div className="space-y-5">
        {!isLoading &&
          data?.map((log, index: number) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg bg-white p-5"
            >
              <div className="flex items-center mb-2">
                <span className="font-semibold text-gray-700">Stage:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-sm font-medium ${log.stage === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {log.stage}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <span className="font-semibold text-gray-700">
                    Request Time:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {dateTimeUtils.formatDateTime(new Date(log.reqTime), "DD/MM/YYYY HH:mm:ss")}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Response Time:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {log.resTime
                      ? dateTimeUtils.formatDateTime(new Date(log.resTime), 'DD/MM/YYYY HH:mm:ss')
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                <div>
                  <span className="font-semibold text-gray-700">
                    Request Data:
                  </span>
                  <JsonView
                    data={log.requestData || {}}
                    style={defaultStyles}
                  />
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Response Data:
                  </span>
                  <JsonView
                    data={log.responseData || {}}
                    style={defaultStyles}
                    compactTopLevel={true}
                  />
                </div>
              </div>
              {log.error && (
                <div className="mt-4">
                  <span className="font-semibold text-red-700">Error:</span>
                  <JsonView
                    data={log.responseData || {}}
                    style={defaultStyles}
                    compactTopLevel={true}
                  />
                </div>
              )}
            </div>
          ))}
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
