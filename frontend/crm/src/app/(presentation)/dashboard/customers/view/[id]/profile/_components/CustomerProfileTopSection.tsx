"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ASSETS_URL } from "@/global/constants/domains";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import type { CustomerByIdPayload } from "@root/apiGateway";
import {
  Activity,
  Bell,
  CalendarDays,
  FileCheck2,
  Hash,
  Shield,
} from "lucide-react";
import { ReactNode } from "react";

function formatUserType(userType?: string) {
  if (!userType) return "—";
  return userType.replace(/_/g, " ");
}

function displayName(customer: CustomerByIdPayload) {
  return [customer.firstName, customer.middleName, customer.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function StatItem({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: typeof Activity;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>{label}</span>
      </div>
      <div className="mt-1.5 min-w-0">{children}</div>
    </div>
  );
}

export function CustomerProfileTopSection({
  customer,
  showKra,
}: {
  customer: CustomerByIdPayload;
  showKra?: boolean;
}) {
  const name = displayName(customer);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const kraStatus = customer.kraStatus || "Not Started";

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5">
          <Avatar className="h-14 w-14 shrink-0 border shadow-sm">
            {customer.avatar ? (
              <AvatarImage src={`${ASSETS_URL}/${customer.avatar}`} alt={name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {initials || "CU"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-lg font-semibold leading-tight tracking-tight">
                {name || "—"}
              </h2>
              {customer.userName && (
                <span className="text-sm text-muted-foreground">
                  @{customer.userName}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {formatUserType(customer.userType)}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                {customer.userName || "—"}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {customer.createdAt
                  ? dateTimeUtils.formatDateTime(customer.createdAt, "DD MMM YYYY")
                  : "—"}
              </span>
            </div>

            {customer.legalEntityName?.trim() && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Legal entity:</span>{" "}
                {customer.legalEntityName}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div
          className={
            showKra
              ? "grid grid-cols-2 gap-4 p-4 lg:grid-cols-4"
              : "grid grid-cols-2 gap-4 p-4 lg:grid-cols-3"
          }
        >
          <StatItem icon={Activity} label="Account">
            <StatusBadge value={customer.utility.accountStatus} />
          </StatItem>
          <StatItem icon={FileCheck2} label="KYC">
            <StatusBadge value={customer.kycStatus} />
          </StatItem>
          {showKra && (
            <StatItem icon={Shield} label="KRA" className="min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-full">
                    <StatusBadge value={kraStatus} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  {kraStatus}
                </TooltipContent>
              </Tooltip>
            </StatItem>
          )}
          <StatItem icon={Bell} label="WhatsApp">
            <StatusBadge
              value={customer.utility.whatsAppNotificationAllow ? "Accepted" : "Pending"}
            />
          </StatItem>
        </div>
      </CardContent>
    </Card>
  );
}
