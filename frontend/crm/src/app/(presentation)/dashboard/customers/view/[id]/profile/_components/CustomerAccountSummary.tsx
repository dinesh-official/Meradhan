"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import type { CustomerByIdPayload } from "@root/apiGateway";
import { Shield } from "lucide-react";
import { ReactNode } from "react";

export function CustomerTimelineCard({
  customer,
}: {
  customer: CustomerByIdPayload;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Account timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LabelView title="Created">
            <p className="text-sm">
              {customer.createdAt
                ? dateTimeUtils.formatDateTime(
                    customer.createdAt,
                    "DD MMM YYYY, hh:mm A",
                  )
                : "—"}
            </p>
          </LabelView>
          <LabelView title="Last updated">
            <p className="text-sm">
              {customer.updatedAt
                ? dateTimeUtils.formatDateTime(
                    customer.updatedAt,
                    "DD MMM YYYY, hh:mm A",
                  )
                : "—"}
            </p>
          </LabelView>
          <LabelView title="Last login">
            <p className="text-sm">
              {customer.utility.lastLogin
                ? dateTimeUtils.formatDateTime(
                    customer.utility.lastLogin,
                    "DD MMM YYYY, hh:mm A",
                  )
                : "Never"}
            </p>
          </LabelView>
          <LabelView title="Terms accepted">
            <StatusBadge
              value={customer.utility.termsAccepted ? "Accepted" : "pending"}
            />
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileSectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: typeof Shield;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export { ProfileSectionCard };
