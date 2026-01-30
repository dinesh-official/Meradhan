"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerByIdPayload } from "@root/apiGateway";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import KYCVerificationStatusCard from "./cards/KYCVerificationStatusCard";
import KraLogsView from "./KraLogsView";

const NON_INDIVIDUAL_USER_TYPES = [
  "CORPORATE",
  "TRUST",
  "HUF",
  "LLP",
  "PARTNERSHIP_FIRM",
] as const;

function isNonIndividual(userType: string): boolean {
  return (NON_INDIVIDUAL_USER_TYPES as readonly string[]).includes(userType);
}

export { isNonIndividual, NON_INDIVIDUAL_USER_TYPES };

type CorporateKycViewProps = {
  data: CustomerByIdPayload;
};

function CorporateKycView({ data }: CorporateKycViewProps) {
  const displayName =
    data.userType === "CORPORATE"
      ? data.firstName || "Company"
      : `${data.firstName}${data.middleName ? ` ${data.middleName}` : ""} ${data.lastName}`.trim();

  return (
    <div className="relative flex flex-col gap-5 mt-5">
      <div className="gap-5 flex flex-col">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {displayName}
              <Badge variant="secondary">{data.userType}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <p>Corporate / non-individual KYC view</p>
            <p className="mt-1">
              Customer since:{" "}
              {dateTimeUtils.formatDateTime(data.createdAt, "DD MMM YYYY")}
            </p>
          </CardContent>
        </Card>

        <KYCVerificationStatusCard
          kycLevel="-----"
          overallStatus={data.kycStatus}
          verifiedBy="--"
          verifiedDate={
            !data.verifyDate
              ? "--"
              : dateTimeUtils.formatDateTime(
                  data.verifyDate,
                  "DD MMM YYYY hh:mm:ss AA",
                )
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Corporate KYC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Corporate KYC form and data capture (company name, company PAN,
            incorporation details, directors, authorized signatories,
            documents) are under development.
          </p>
          <p className="text-muted-foreground text-sm">
            Use this section to view and manage company KYC once the flow is
            implemented. See{" "}
            <code className="text-xs bg-muted px-1 rounded">docs/CORPORATE_KYC_PLAN.md</code>{" "}
            for the work plan.
          </p>
        </CardContent>
      </Card>

      <KraLogsView id={data.id} />
    </div>
  );
}

export default CorporateKycView;
