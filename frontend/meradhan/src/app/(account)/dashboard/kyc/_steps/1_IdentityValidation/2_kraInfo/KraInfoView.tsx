"use client";

import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IoMdArrowDropright } from "react-icons/io";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { IKraDownloadResponse } from "@root/apiGateway";

function formatGender(gen: string | null): string {
  if (!gen) return "";
  const g = (gen || "").toUpperCase();
  if (g === "M") return "MALE";
  if (g === "F") return "FEMALE";
  return gen;
}

function formatCountry(code: string | null): string {
  if (!code) return "";
  if (code === "101") return "India";
  return code;
}

export interface KraInfoViewProps {
  kra: IKraDownloadResponse;
  /** Preview mode: show UI only, no actions (for screenshot/test) */
  preview?: boolean;
  /** When not preview: confirmation checkbox state */
  confirmed?: boolean;
  onConfirmedChange?: (v: boolean) => void;
  onUseExisting?: () => void;
  onStartFresh?: () => void;
  isPending?: boolean;
}

export function KraInfoView({
  kra,
  preview = false,
  confirmed = false,
  onConfirmedChange,
  onUseExisting,
  onStartFresh,
  isPending = false,
}: KraInfoViewProps) {
  const [showJson, setShowJson] = useState(false);

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">
          Existing KYC Data Fetched from SEBI Regulated KYC Registration
          Agency (KRA)
        </CardTitle>
      </CardHeader>
      <CardContent accountMode className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Personal Information
          </h3>
          <div className="gap-4 grid md:grid-cols-2">
            <DataInfoLabel
              title="PAN Number"
              status={kra.isPANMatch ? "SUCCESS" : "ERROR"}
              statusLabel={kra.isPANMatch ? "Verified" : "Not Verified"}
              showStatus
            >
              <p className="font-medium">{kra.appPanNo ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel
              title="Name as per PAN"
              status={kra.isNameMatch ? "SUCCESS" : "ERROR"}
              statusLabel={kra.isNameMatch ? "Matched" : "Not Matched"}
              showStatus
            >
              <p className="font-medium">{kra.appName ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel
              title="Date of Birth"
              status={kra.isDOBMatch ? "SUCCESS" : "ERROR"}
              statusLabel={kra.isDOBMatch ? "Verified" : "Not Verified"}
              showStatus
            >
              <p className="font-medium">
                {kra.appDobDt?.replace(/\//g, "-") ?? "-"}
              </p>
            </DataInfoLabel>
            <DataInfoLabel title="Email ID">
              <p className="font-medium">{kra.appEmail ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Mobile Number">
              <p className="font-medium">
                {kra.appMobNo ? `+91 ${kra.appMobNo}` : "-"}
              </p>
            </DataInfoLabel>
            <DataInfoLabel title="Gender">
              <p className="font-medium">{formatGender(kra.appGen)}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Father's / Spouse Name">
              <p className="font-medium">{kra.appFName ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Occupation Type">
              <p className="font-medium">{kra.appOcc ?? kra.appOthOcc ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Income Range">
              <p className="font-medium">{kra.appIncome ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Marital Status">
              <p className="font-medium">{kra.appMarStatus ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Nationality">
              <p className="font-medium">{kra.appNationality ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Applicant Type">
              <p className="font-medium">
                {kra.appType === "I" ? "Individual" : kra.appType ?? "-"}
              </p>
            </DataInfoLabel>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Correspondence Address
          </h3>
          <div className="gap-4 grid md:grid-cols-2">
            <DataInfoLabel title="Line 1">
              <p className="font-medium">{kra.appCorAdd1 ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Line 2">
              <p className="font-medium">{kra.appCorAdd2 ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Line 3">
              <p className="font-medium">{kra.appCorAdd3 ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="City">
              <p className="font-medium">{kra.appCorCity ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="District">
              <p className="font-medium">-</p>
            </DataInfoLabel>
            <DataInfoLabel title="State">
              <p className="font-medium">{kra.appCorState ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Pincode">
              <p className="font-medium">{kra.appCorPincd ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Country">
              <p className="font-medium">{formatCountry(kra.appCorCtry)}</p>
            </DataInfoLabel>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Permanent Address
          </h3>
          <div className="gap-4 grid md:grid-cols-2">
            <DataInfoLabel title="Line 1">
              <p className="font-medium">{kra.appPerAdd1 ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Line 2">
              <p className="font-medium">{kra.appPerAdd2 ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Line 3">
              <p className="font-medium">{kra.appPerAdd3 ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="City">
              <p className="font-medium">{kra.appPerCity ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="District">
              <p className="font-medium">-</p>
            </DataInfoLabel>
            <DataInfoLabel title="State">
              <p className="font-medium">{kra.appPerState ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Pincode">
              <p className="font-medium">{kra.appPerPincd ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Country">
              <p className="font-medium">{formatCountry(kra.appPerCtry)}</p>
            </DataInfoLabel>
          </div>
        </div>

        {!preview && (
          <div className="flex items-start gap-3">
            <Checkbox
              id="kra-confirm"
              checked={confirmed}
              onCheckedChange={(v) => onConfirmedChange?.(!!v)}
              className="mt-0.5 border border-gray-200"
            />
            <label
              htmlFor="kra-confirm"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I confirm that I have reviewed the above details obtained from KRA
              records and wish to proceed with my KYC using the same information.
            </label>
          </div>
        )}

        <Collapsible open={showJson} onOpenChange={setShowJson}>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            {showJson ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            KRA response (test / debug)
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-48">
              {JSON.stringify(kra, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      {!preview && (
        <CardFooter accountMode className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex items-center gap-1 w-full sm:w-auto"
            disabled={!confirmed || isPending}
            onClick={onUseExisting}
            id="use-existing-kyc-btn"
          >
            Use Existing KYC Details
            <IoMdArrowDropright className="text-xl" />
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-1 w-full sm:w-auto border-orange-400 hover:bg-orange-50"
            disabled={!confirmed || isPending}
            onClick={onStartFresh}
            id="start-fresh-kyc-btn"
          >
            Start Fresh KYC
            <IoMdArrowDropright className="text-xl" />
          </Button>
        </CardFooter>
      )}
      {preview && (
        <CardFooter accountMode>
          <p className="text-muted-foreground text-xs">
            KRA view test / screenshot preview (read-only)
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
