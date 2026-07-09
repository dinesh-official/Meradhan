import { AuditLogDataResponse } from "@root/apiGateway";
import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  User,
  Clock,
  Globe,
  Monitor,
  Activity,
} from "lucide-react";
import { dateTimeUtils } from "@/global/utils/datetime.utils";

function AuditLogsView({
  session,
}: {
  session: AuditLogDataResponse["responseData"]["sessions"][0];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getActivityTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "login":
      case "logout":
        return <User className="w-4 h-4" />;
      case "page_view":
        return <Globe className="w-4 h-4" />;
      case "click":
        return <Monitor className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "login":
        return "bg-green-100 text-green-800 border-green-200";
      case "logout":
        return "bg-red-100 text-red-800 border-red-200";
      case "page_view":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "click":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return "N/A";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <Card className="p-2 px-0 w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-gray-50 px-2 transition-colors cursor-pointer">
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-1 items-center min-w-0">
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 ml-4 min-w-0">
                  <CardTitle className="font-semibold text-gray-900 text-md truncate">
                    {session.user.name}
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600 text-sm truncate">
                      {session.user.email}
                    </span>
                    {session.user.role && (
                      <Badge variant="outline" className="font-medium text-xs">
                        {session.user.role}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center space-x-3">
                <Badge
                  variant="secondary"
                  className="px-2 py-1 font-medium text-xs"
                >
                  {session.records.length} activities
                </Badge>
                <span className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-500 text-xs">
                  {session.trackId}
                </span>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-6">
            <div className="space-y-4">
              {session.records.map((record, index) => (
                <div
                  key={record.id || index}
                  className="p-5 border border-gray-200 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-gray-100 p-2 rounded-full">
                      {getActivityTypeIcon(record.type)}
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium px-2 py-1 ${getActivityTypeColor(
                              record.type
                            )}`}
                          >
                            {record.type.replace("_", " ").toUpperCase()}
                          </Badge>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Clock className="mr-2 w-4 h-4" />
                            {dateTimeUtils.formatDateTime(
                              record.createdAt,
                              "DD MMMM YYYY hh:mm:ss AA"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="gap-5 grid grid-cols-2">
                        {record.url && (
                          <div className="bg-blue-50 p-3 border border-blue-200 rounded-md">
                            <div className="flex items-start space-x-2">
                              <Globe className="flex-shrink-0 mt-0.5 w-4 h-4 text-blue-600" />
                              <div className="flex-1 min-w-0">
                                <span className="block font-medium text-blue-900 text-sm">
                                  URL:
                                </span>
                                <span className="text-blue-700 text-sm break-all">
                                  {record.url}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {record.data?.title && (
                          <div className="bg-green-50 p-3 border border-green-200 rounded-md">
                            <div className="flex items-start space-x-2">
                              <Monitor className="flex-shrink-0 mt-0.5 w-4 h-4 text-green-600" />
                              <div className="flex-1 min-w-0">
                                <span className="block font-medium text-green-900 text-sm">
                                  Page:
                                </span>
                                <span className="text-green-700 text-sm">
                                  {record.data.title}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {record.data && (
                        <div className="p-4 border rounded-md">
                          <h4 className="mb-3 font-medium text-gray-900 text-sm">
                            Session Details
                          </h4>
                          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {record.data.browser && (
                              <div className="flex flex-col space-y-1">
                                <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                                  Browser
                                </span>
                                <span className="text-gray-900 text-sm">
                                  {record.data.browser}
                                </span>
                              </div>
                            )}
                            {record.data.os && (
                              <div className="flex flex-col space-y-1">
                                <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                                  OS
                                </span>
                                <span className="text-gray-900 text-sm">
                                  {record.data.os}
                                </span>
                              </div>
                            )}
                            {record.data.duration && (
                              <div className="flex flex-col space-y-1">
                                <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                                  Duration
                                </span>
                                <span className="text-gray-900 text-sm">
                                  {formatDuration(record.data.duration)}
                                </span>
                              </div>
                            )}
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                                Clicks
                              </span>
                              <span className="text-gray-900 text-sm">
                                {record.data.clicks || 0}
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                                Scroll
                              </span>
                              <span className="text-gray-900 text-sm">
                                {record.data.maxScrollPercent}%
                              </span>
                            </div>
                            {record.data.screen && (
                              <div className="flex flex-col space-y-1">
                                <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                                  Screen
                                </span>
                                <span className="text-gray-900 text-sm">
                                  {record.data.screen.width}x
                                  {record.data.screen.height}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {record.data?.ipData && (
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center space-x-2 mb-3">
                            <Globe className="w-4 h-4" />
                            <h4 className="font-medium text-sm">
                              Location Information
                            </h4>
                          </div>
                          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-xs uppercase tracking-wide">
                                IP Address
                              </span>
                              <span className="font-mono text-sm">
                                {record.data.ipData.ip}
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-xs uppercase tracking-wide">
                                Location
                              </span>
                              <span className="text-sm">
                                {record.data.ipData.city},{" "}
                                {record.data.ipData.country}
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-xs uppercase tracking-wide">
                                ISP
                              </span>
                              <span className="text-sm">
                                {record.data.ipData.org}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {record.data?.reason && (
                        <div className="bg-amber-50 p-4 border border-amber-200 rounded-md">
                          <div className="flex items-start space-x-2">
                            <Activity className="flex-shrink-0 mt-0.5 w-4 h-4 text-amber-600" />
                            <div className="flex-1 min-w-0">
                              <span className="block mb-1 font-medium text-amber-900 text-sm">
                                Reason:
                              </span>
                              <span className="text-amber-800 text-sm">
                                {record.data.reason}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default AuditLogsView;
