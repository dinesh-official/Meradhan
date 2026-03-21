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
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
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

/** KRA marital status: Code 01 = Married, 02 = Unmarried (per KRA spec) */
function formatMaritalStatus(code: string | null): string {
  if (!code) return "-";
  const c = String(code).trim();
  if (c === "01") return "Married";
  if (c === "02") return "Unmarried";
  return code;
}

/** KRA status code → display label (per KRA spec) */
const KRA_STATUS_LABELS: Record<string, string> = {
  "00": "Not specified",
  "01": "Under Process",
  "02": "KYC Registered",
  "03": "On Hold",
  "04": "KYC Rejected",
  "05": "Not Available",
  "06": "Deactivate",
  "07": "KYC Validated",
  "12": "KYC Registered",
  "13": "Under Process",
  "14": "On Hold",
  "21": "Mutual Fund Under Process",
  "22": "Mutual Fund Verified",
};

/** True when APP_STATUS allows proceeding with existing KRA (not blocked). */
export const isAllowedKraStatus = (status: string): boolean => {
  return ["02", "07", "12"].includes(String(status ?? "").trim());
  // 00: not specified / placeholder, 02/12: KYC Registered, 07: KYC Validated
};

function formatKraStatus(code: string | null | undefined): string {
  if (!code) return "-";
  const c = String(code).trim();
  return KRA_STATUS_LABELS[c] ?? code;
}

/** KRA nationality code → display label (per KRA spec) */
const KRA_NATIONALITY_LABELS: Record<string, string> = {
  "01": "Indian",
  "02": "Other",
};

function formatNationality(code: string | null): string {
  if (!code) return "-";
  const c = String(code).trim();
  return KRA_NATIONALITY_LABELS[c] ?? code;
}

/**
 * KRA state / UT codes (API Download file format May 2025)
 * Use the numeric value as key (3 digits), and the state name as value.
 * Example: "027" -> "Maharashtra"
 */
const KRA_STATE_LABELS: Record<string, string> = {
  "001": "Jammu & Kashmir",
  "002": "Himachal Pradesh",
  "003": "Punjab",
  "004": "Chandigarh",
  "005": "Uttarakhand",
  "006": "Haryana",
  "007": "Delhi",
  "008": "Rajasthan",
  "009": "Uttar Pradesh",
  "010": "Bihar",
  "011": "Sikkim",
  "012": "Arunachal Pradesh",
  "013": "Assam",
  "014": "Manipur",
  "015": "Mizoram",
  "016": "Tripura",
  "017": "Meghalaya",
  "018": "Nagaland",
  "019": "West Bengal",
  "020": "Jharkhand",
  "021": "Odisha",
  "022": "Chhattisgarh",
  "023": "Madhya Pradesh",
  "024": "Gujarat",
  "025": "Daman & Diu",
  "026": "Dadra & Nagar Haveli",
  "027": "Maharashtra",
  "028": "Andhra Pradesh",
  "029": "Karnataka",
  "030": "Goa",
  "031": "Lakshadweep",
  "032": "Kerala",
  "033": "Tamil Nadu",
  "034": "Puducherry",
  "035": "Andaman & Nicobar Islands",
  "036": "Ladakh",
  "037": "Telangana",
  "099": "Others (please specify)",
};

/** State name + KRA code, e.g. "Maharashtra (15)" */
function formatKraState(code: string | null): string {
  if (!code?.trim()) return "-";
  const c = code.trim();
  if (/^\d+$/.test(c)) {
    const key = String(parseInt(c, 10)).padStart(3, "0");
    const label = KRA_STATE_LABELS[key];
    if (label) return `${label}`;
    return c;
  }
  return c;
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
  confirmed = true,
  onConfirmedChange,
  onUseExisting,
  onStartFresh,
  isPending = false,
}: KraInfoViewProps) {
  const canProceedWithExistingKyc =
    kra.isNameMatch &&
    kra.isDOBMatch &&
    kra.isPANMatch &&
    kra.isMobileMatch &&
    kra.isEmailMatch;

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">
          Existing KYC Data Fetched from SEBI Regulated KYC Registration
          Agency (KRA)
        </CardTitle>
      </CardHeader>
      <CardContent accountMode className="space-y-6">
        {kra?.appStatus && (
          <div className="rounded-md bg-muted/60 px-3 py-2 text-sm">
            <span className="font-medium text-muted-foreground">KRA Status: </span>
            <span className="font-medium">{formatKraStatus(kra.appStatus)} (as per KRA records)</span>
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Personal Information
          </h3>
          <div className="gap-4 grid md:grid-cols-3">
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
            <DataInfoLabel
              title="Email ID"
              status={kra.isEmailMatch ? "SUCCESS" : "ERROR"}
              statusLabel={kra.isEmailMatch ? "Matched" : "Not Matched"}
              showStatus
            >
              <p className="font-medium">{kra.appEmail ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel
              title="Mobile Number"
              status={kra.isMobileMatch ? "SUCCESS" : "ERROR"}
              statusLabel={kra.isMobileMatch ? "Matched" : "Not Matched"}
              showStatus
            >
              <p className="font-medium">
                {kra.appMobNo ? `${kra.appMobNo}` : "-"}
              </p>
            </DataInfoLabel>
            <DataInfoLabel title="Gender">
              <p className="font-medium">{formatGender(kra.appGen)}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Father's / Spouse Name">
              <p className="font-medium">{kra.appFName ?? "-"}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Marital Status">
              <p className="font-medium">{formatMaritalStatus(kra.appMarStatus)}</p>
            </DataInfoLabel>
            <DataInfoLabel title="Nationality">
              <p className="font-medium">{formatNationality(kra.appNationality)}</p>
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
          <div className="gap-4 grid md:grid-cols-3">
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
              <p className="font-medium">{formatKraState(kra.appCorState)}</p>
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
          <div className="gap-4 grid md:grid-cols-3">
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
              <p className="font-medium">{formatKraState(kra.appPerState)}</p>
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
              records and i agree to proceed with my KYC using the same information.
            </label>
          </div>
        )}

      </CardContent>
      {!preview && (
        <CardFooter accountMode className="flex flex-col gap-3 items-start text-left">
          {!canProceedWithExistingKyc && (
            <p className="text-sm text-amber-600 dark:text-amber-500 text-left">
              All verifications (PAN, Name, DOB, Mobile, Email) must match your
              profile to use existing KYC. Please choose Start Fresh KYC.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <Button
              className="flex items-center gap-1 w-full sm:w-auto"
              disabled={
                !confirmed ||
                isPending ||
                !canProceedWithExistingKyc ||
                !isAllowedKraStatus(kra.appStatus ?? "")
              }
              onClick={async () => {
                const result = await Swal.fire({
                  title: "Confirm Use of Existing KYC",
                  text: "You have chosen to proceed using the KYC details available in the KRA records. By continuing, you confirm that these details belong to you and are correct.",
                  showCancelButton: true,
                  confirmButtonText: "Continue",
                  cancelButtonText: "Go Back",
                  icon: "question",
                });
                if (result.isConfirmed) onUseExisting?.();
              }}
              id="use-existing-kyc-btn"
            >
              Use Existing KYC Details
              <IoMdArrowDropright className="text-xl" />
            </Button>
            <Button
              variant="outlineSecondary"
              className="flex items-center gap-1 w-full sm:w-auto "
              disabled={!confirmed || isPending}
              onClick={onStartFresh}
              id="start-fresh-kyc-btn"
            >
              Start Fresh KYC
              <IoMdArrowDropright className="text-xl" />
            </Button>
          </div>
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
