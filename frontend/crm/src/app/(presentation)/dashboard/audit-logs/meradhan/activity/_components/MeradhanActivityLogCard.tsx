"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { Activity, Clock, Globe } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface MeradhanActivityLogCardProps {
  activity: {
    id: number;
    userId?: number | null;
    name?: string | null;
    email: string;
    entityType: string;
    action: string;
    entityId?: string | null;
    ipAddress?: string | null;
    details: object;
    userAgent?: string | null;
    browserName?: string | null;
    deviceType?: string | null;
    operatingSystem?: string | null;
    url: string;
    createdAt: string;
    updatedAt: string;
  };
}

function MeradhanActivityLogCard({ activity }: MeradhanActivityLogCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getActivityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "create":
        return "bg-green-100 text-green-800 border-green-200";
      case "update":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delete":
        return "bg-red-100 text-red-800 border-red-200";
      case "view":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="p-2 px-0 w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="hover:bg-gray-50 px-4 py-3 transition-colors cursor-pointer">
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-1 items-center gap-4 min-w-0">
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-shrink-0 bg-gray-100 p-2 rounded-full">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {activity.name || activity.email}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium px-2 py-0.5 ${getActivityTypeColor(
                        activity.action
                      )}`}
                    >
                      {activity.action.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {activity.entityType}{" "}
                    {activity.entityId ? `(#${activity.entityId})` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="mr-2 w-4 h-4" />
                  {dateTimeUtils.formatDateTime(
                    activity.createdAt,
                    "DD MMM YYYY hh:mm:ss AA"
                  )}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 space-y-4">
            {activity.url && (
              <div className="bg-blue-50 p-3 border border-blue-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <Globe className="flex-shrink-0 mt-0.5 w-4 h-4 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <span className="block font-medium text-blue-900 text-sm">
                      URL:
                    </span>
                    <span className="text-blue-700 text-sm break-all">
                      {activity.url}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 border rounded-md">
              <h4 className="mb-3 font-medium text-gray-900 text-sm">
                Device & Browser Information
              </h4>
              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {activity.browserName && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      Browser
                    </span>
                    <span className="text-gray-900 text-sm">
                      {activity.browserName}
                    </span>
                  </div>
                )}
                {activity.operatingSystem && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      OS
                    </span>
                    <span className="text-gray-900 text-sm">
                      {activity.operatingSystem}
                    </span>
                  </div>
                )}
                {activity.deviceType && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      Device
                    </span>
                    <span className="text-gray-900 text-sm">
                      {activity.deviceType}
                    </span>
                  </div>
                )}
                {activity.ipAddress && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      IP Address
                    </span>
                    <span className="font-mono text-gray-900 text-sm">
                      {activity.ipAddress}
                    </span>
                  </div>
                )}
                {activity.userId && (
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                      User ID
                    </span>
                    <span className="text-gray-900 text-sm">
                      {activity.userId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {activity.details && Object.keys(activity.details).length > 0 && (
              <div className="p-4 border rounded-md">
                <h4 className="mb-3 font-medium text-gray-900 text-sm">
                  Additional Details
                </h4>
                <pre className="bg-gray-50 p-3 rounded font-mono text-gray-700 text-xs overflow-x-auto">
                  {JSON.stringify(activity.details, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default MeradhanActivityLogCard;
