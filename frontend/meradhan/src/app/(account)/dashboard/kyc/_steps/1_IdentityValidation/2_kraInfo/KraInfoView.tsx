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

function formatKraStatus(code: string | null): string {
  if (!code) return "-";
  const c = String(code).trim();
  return KRA_STATUS_LABELS[c] ?? code;
}

/** KRA income code → display label (per KRA spec) */
const KRA_INCOME_LABELS: Record<string, string> = {
  "01": "Below 1 Lac",
  "02": "1 - 5 Lakhs",
  "03": "5 - 10 Lakhs",
  "04": "10 - 25 Lakhs",
  "05": "25 Lakhs +",
};

function formatIncomeRange(code: string | null): string {
  if (!code) return "-";
  const c = String(code).trim();
  return KRA_INCOME_LABELS[c] ?? code;
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

/** KRA occupation (numeric) — API Download file format May 2025 */
const KRA_OCCUPATION_CODE_LABELS: Record<string, string> = {
  "01": "Private Sector Service",
  "02": "Public Sector",
  "03": "Government Service",
  "04": "Business",
  "05": "Professional",
  "06": "Agriculturist",
  "07": "Retired",
  "08": "Housewife",
  "09": "Student",
  "10": "Others (Please specify)",
};

/** KRA occupation type (single letter) — same spec */
const KRA_OCCUPATION_TYPE_LETTER: Record<string, string> = {
  S: "Service",
  B: "Business",
  O: "Others",
  P: "Professional",
  A: "Agriculturist",
  R: "Retired",
  H: "Housewife",
  T: "Student",
};

function formatOccupation(occ: string | null, othOcc: string | null): string {
  const oth = othOcc?.trim() ?? "";
  if (!occ?.trim() && !oth) return "-";
  const c = (occ ?? "").trim();
  if (!c) return oth;

  if (/^\d+$/.test(c)) {
    const key = String(parseInt(c, 10)).padStart(2, "0");
    const label = KRA_OCCUPATION_CODE_LABELS[key];
    if (label) {
      if (key === "10" && oth) return `${label}: ${oth}`;
      return label;
    }
  }
  if (c.length === 1) {
    const letter = c.toUpperCase();
    if (KRA_OCCUPATION_TYPE_LETTER[letter]) {
      const base = KRA_OCCUPATION_TYPE_LETTER[letter];
      if (letter === "O" && oth) return `${base}: ${oth}`;
      return base;
    }
  }
  return oth ? `${c} (${oth})` : c;
}

/** KRA state / UT code — API Download file format May 2025 */
const KRA_STATE_LABELS: Record<string, string> = {
  "01": "Andhra Pradesh",
  "02": "Arunachal Pradesh",
  "03": "Assam",
  "04": "Bihar",
  "05": "Chhattisgarh",
  "06": "Goa",
  "07": "Gujarat",
  "08": "Haryana",
  "09": "Himachal Pradesh",
  "10": "Jammu and Kashmir",
  "11": "Jharkhand",
  "12": "Karnataka",
  "13": "Kerala",
  "14": "Madhya Pradesh",
  "15": "Maharashtra",
  "16": "Manipur",
  "17": "Meghalaya",
  "18": "Mizoram",
  "19": "Nagaland",
  "20": "Odisha",
  "21": "Punjab",
  "22": "Rajasthan",
  "23": "Sikkim",
  "24": "Tamil Nadu",
  "25": "Telangana",
  "26": "Tripura",
  "27": "Uttar Pradesh",
  "28": "Uttarakhand",
  "29": "West Bengal",
  "30": "Andaman and Nicobar Islands",
  "31": "Chandigarh",
  "32": "Dadra and Nagar Haveli and Daman and Diu",
  "33": "Delhi",
  "34": "Lakshadweep",
  "35": "Puducherry",
  "36": "Ladakh",
  "37": "Other",
  "99": "Others",
};

/** State name + KRA code, e.g. "Maharashtra (15)" */
function formatKraState(code: string | null): string {
  if (!code?.trim()) return "-";
  const c = code.trim();
  if (/^\d+$/.test(c)) {
    const key = String(parseInt(c, 10)).padStart(2, "0");
    const label = KRA_STATE_LABELS[key];
    if (label) return `${label} (${key})`;
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
  confirmed = false,
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
        {kra.appStatus && (
          <div className="rounded-md bg-muted/60 px-3 py-2 text-sm">
            <span className="font-medium text-muted-foreground">KRA Status: </span>
            <span className="font-medium">{formatKraStatus(kra.appStatus)}</span>
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
              <p className="font-medium">
                {formatOccupation(kra.appOcc, kra.appOthOcc)}
              </p>
            </DataInfoLabel>
            <DataInfoLabel title="Income Range">
              <p className="font-medium">{formatIncomeRange(kra.appIncome)}</p>
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
              records and wish to proceed with my KYC using the same information.
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
              disabled={!confirmed || isPending || !canProceedWithExistingKyc}
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
              variant="secondary"
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
