"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { ChevronDown, ChevronRight, Globe } from "lucide-react";
import { useState } from "react";

interface MeradhanSessionLogCardProps {
  session: {
    id: number;
    userId?: number | null;
    sessionToken: string;
    trackingToken: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    browserName?: string | null;
    deviceType?: string | null;
    operatingSystem?: string | null;
    endReason?: string | null;
    startTime: string;
    endTime?: string | null;
    duration: number;
    totalPages: number;
    createdAt: string;
    updatedAt: string;
    user?: {
      firstName: string;
      middleName?: string | null;
      lastName: string;
    } | null;
    pageViews: Array<{
      id: number;
      sessionId: string;
      userId?: number | null;
      pagePath: string;
      pageTitle?: string | null;
      entryTime: string;
      exitTime?: string | null;
      duration: number;
      scrollDepth: number;
      interactions: number;
      referrer?: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

function MeradhanSessionLogCard({ session }: MeradhanSessionLogCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDuration = (duration?: number) => {
    if (!duration) return "N/A";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const userName = session.user
    ? `${session.user.firstName} ${session.user.middleName || ""} ${session.user.lastName
      }`.trim()
    : "Guest User";

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
                    {userName}
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600 text-sm">
                      Session: {session.trackingToken}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center space-x-3">
                <Badge
                  variant="secondary"
                  className="px-2 py-1 font-medium text-xs"
                >
                  {session.totalPages} pages
                </Badge>
                <Badge
                  variant="outline"
                  className="px-2 py-1 font-medium text-xs"
                >
                  {formatDuration(session.duration)}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-6 space-y-4">
            {/* Session Info */}
            <div className="p-4 border rounded-md">
              <h4 className="mb-3 font-medium text-gray-900 text-sm">
                Session Information
              </h4>
              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                    Start Time
                  </span>
                  <span className="text-gray-900 text-sm">
                    {dateTimeUtils.formatDateTime(
                      session.startTime,
                      "DD MMM YYYY hh:mm:ss AA"
                    )}
                  </span>
                </div>
                {session.endTime && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      End Time
                    </span>
                    <span className="text-gray-900 text-sm">
                      {dateTimeUtils.formatDateTime(
                        session.endTime,
                        "DD MMM YYYY hh:mm:ss AA"
                      )}
                    </span>
                  </div>
                )}
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                    Duration
                  </span>
                  <span className="text-gray-900 text-sm">
                    {formatDuration(session.duration)}
                  </span>
                </div>
                {session.browserName && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      Browser
                    </span>
                    <span className="text-gray-900 text-sm">
                      {session.browserName}
                    </span>
                  </div>
                )}
                {session.operatingSystem && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      OS
                    </span>
                    <span className="text-gray-900 text-sm">
                      {session.operatingSystem}
                    </span>
                  </div>
                )}
                {session.deviceType && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      Device
                    </span>
                    <span className="text-gray-900 text-sm capitalize">
                      {session.deviceType}
                    </span>
                  </div>
                )}
                {session.ipAddress && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      IP Address
                    </span>
                    <span className="font-mono text-gray-900 text-sm">
                      {session.ipAddress}
                    </span>
                  </div>
                )}
                {session.endReason && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      End Reason
                    </span>
                    <span className="text-gray-900 text-sm">
                      {session.endReason}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Page Views */}
            {session.pageViews.length > 0 && (
              <div className="p-4 border rounded-md">
                <h4 className="mb-3 font-medium text-gray-900 text-sm">
                  Page Views ({session.pageViews.length})
                </h4>
                <div className="space-y-3">
                  {session.pageViews.map((pageView) => (
                    <div
                      key={pageView.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                          <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 text-sm truncate">
                                {pageView.pageTitle || "Untitled Page"}
                              </h5>
                              <p className="text-gray-600 text-xs break-all">
                                {pageView.pagePath}
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {formatDuration(pageView.duration)}
                            </Badge>
                          </div>
                          <div className="gap-4 grid grid-cols-2 sm:grid-cols-4 text-xs">
                            <div className="flex flex-col">
                              <span className="text-gray-500">Entry</span>
                              <span className="text-gray-900">
                                {dateTimeUtils.formatDateTime(
                                  pageView.entryTime,
                                  "hh:mm:ss AA"
                                )}
                              </span>
                            </div>
                            {pageView.exitTime && (
                              <div className="flex flex-col">
                                <span className="text-gray-500">Exit</span>
                                <span className="text-gray-900">
                                  {dateTimeUtils.formatDateTime(
                                    pageView.exitTime,
                                    "hh:mm:ss AA"
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-gray-500">Scroll</span>
                              <span className="text-gray-900">
                                {pageView.scrollDepth}%
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-500">Clicks</span>
                              <span className="text-gray-900">
                                {pageView.interactions}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default MeradhanSessionLogCard;
