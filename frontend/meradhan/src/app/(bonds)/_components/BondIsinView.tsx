import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import BondsByCategories from "@/global/components/Bond/BondsByCategories";
import { SortInfoBox } from "@/global/components/wrapper/cards/SortInfoBox";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { formatNumberTS } from "@/global/utils/formate";
import { BondDetailResponse, ISessionResponse } from "@root/apiGateway";
import { FaInfoCircle } from "react-icons/fa";
import { PiCurrencyInrBold } from "react-icons/pi";
import BondInfoHeader from "./BondInfoHeader";
import { isKycVerified, isKraVerified } from "@/global/utils/customerVerification";
import { canShowBuyNow } from "@/global/utils/bondPurchaseEligibility";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Bond = BondDetailResponse["responseData"];

/**
 * Treats null / undefined / empty / "n/a" / "-" as "no data" so the field can be hidden.
 * Numeric `hideIfZero` is opt-in because some fields legitimately store 0 (e.g. recordDays).
 */
function hasValue(
  v: unknown,
  opts?: { hideIfZero?: boolean },
): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return false;
    if (/^(n\/?a|none|-+|null|undefined)$/i.test(t)) return false;
    return true;
  }
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return false;
    if (opts?.hideIfZero && v === 0) return false;
    return true;
  }
  return true;
}

function formatPercent(v: number | string | null | undefined): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return `${n.toFixed(2)}%`;
}

function formatDate(v: string | number | null | undefined): string {
  return dateTimeUtils.formatDateTime(
    v as Parameters<typeof dateTimeUtils.formatDateTime>[0],
    "DD MMM YYYY",
  );
}

function humanize(v: string | null | undefined): string {
  return (v ?? "").replaceAll("_", " ");
}

function yesNo(v: boolean | string | null | undefined): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  if (typeof v === "string") {
    const t = v.trim().toUpperCase();
    if (t === "YES" || t === "Y" || t === "TRUE") return "Yes";
    if (t === "NO" || t === "N" || t === "FALSE") return "No";
    return v;
  }
  return "";
}

function deriveSecurity(bond: Bond): string {
  const src = (bond.natureOfInstrument || bond.instrumentName || "").toUpperCase();
  if (src.includes("UNSECURED")) return "Unsecured";
  if (src.includes("SECURED")) return "Secured";
  return "";
}

const TAX_STATUS_LABELS: Record<string, string> = {
  TAXABLE: "Taxable",
  TAX_FREE: "Tax Free",
  TAX_SAVING: "Tax Saving",
  TAX_EXEMPTION: "Tax Exemption",
};

function formatTaxStatus(taxStatus: string | null | undefined): string {
  if (!taxStatus) return "";
  return TAX_STATUS_LABELS[taxStatus] ?? "";
}

function deriveCategory(bond: Bond): string {
  const raw = bond.categories?.[0];
  if (!raw || raw.toLowerCase() === "n/a") return "";
  const upper = ["nbfc", "psu"];
  return upper.includes(raw.toLowerCase()) ? raw.toUpperCase() : raw;
}

function splitPutCall(details: string | null | undefined): {
  put: string;
  call: string;
} {
  if (!details) return { put: "", call: "" };
  const put = details.split("Call:")[0]?.replace("Put:", "").trim() ?? "";
  const call = details.split("Call:")[1]?.trim() ?? "";
  return { put, call };
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}...`;
}

/** Renders a SortInfoBox card only when `condition` is truthy. */
function InfoCard({
  title,
  condition,
  children,
}: {
  title: string;
  condition: boolean;
  children: React.ReactNode;
}) {
  if (!condition) return null;
  return <SortInfoBox title={title}>{children}</SortInfoBox>;
}

/** Renders a labelled long-text row only when `condition` is truthy. */
function DetailRow({
  label,
  condition,
  children,
}: {
  label: string;
  condition: boolean;
  children: React.ReactNode;
}) {
  if (!condition) return null;
  return (
    <div className="flex flex-col gap-1 py-3 border-b last:border-b-0">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-base font-medium wrap-break-word">{children}</p>
    </div>
  );
}

export default function BondIsinView({
  bond,
  session,
}: {
  bond: Bond;
  session?: ISessionResponse["responseData"] | null;
}) {
  const { put: putText, call: callText } = splitPutCall(bond.putCallOptionDetails);
  const security = deriveSecurity(bond);
  const taxStatus = formatTaxStatus(bond.taxStatus);
  const category = deriveCategory(bond);

  const hasAnyLongText =
    hasValue(bond.registrarDetails) ||
    hasValue(bond.debentureTrustee) ||
    hasValue(bond.physicalSecurityAddress) ||
    hasValue(bond.defaultedInRedemption) ||
    hasValue(bond.certificateNumbers) ||
    hasValue(bond.remarks) ||
    hasValue(bond.imDocumentLink) ||
    hasValue(bond.providerName) ||
    hasValue(bond.providerPrice, { hideIfZero: true }) ||
    hasValue(bond.providerQuantity, { hideIfZero: true }) ||
    hasValue(bond.providerInterestDate);

  return (
    <div className="py-10">
      <BondInfoHeader bond={bond} />
      <div className="gap-8 grid lg:grid-cols-3 py-10">
        <div className="lg:col-span-3">
          <div className="gap-5 grid md:grid-cols-3">
            {/* ── Pricing & size ─────────────────────────────────────── */}
            <InfoCard title="Issue Price" condition={hasValue(bond.issuePrice, { hideIfZero: true })}>
              <PiCurrencyInrBold /> {formatNumberTS(bond.issuePrice)}
            </InfoCard>
            <InfoCard title="Face Value" condition={hasValue(bond.faceValue, { hideIfZero: true })}>
              <PiCurrencyInrBold /> {formatNumberTS(bond.faceValue)}
            </InfoCard>
            <InfoCard title="Issue Size" condition={hasValue(bond.totalIssueSize, { hideIfZero: true })}>
              <PiCurrencyInrBold /> {formatNumberTS(bond.totalIssueSize ?? 0)}
            </InfoCard>


            {/* ── Yields & coupon ────────────────────────────────────── */}
            <InfoCard title="Coupon Rate" condition={hasValue(bond.couponRate, { hideIfZero: true })}>
              {formatPercent(bond.couponRate)}
            </InfoCard>
            <InfoCard title="Yield" condition={hasValue(bond.yield, { hideIfZero: true })}>
              {formatPercent(bond.yield as number)}
            </InfoCard>

            <InfoCard title="Coupon Type" condition={hasValue(bond.couponType)}>
              {String(bond.couponType)}
            </InfoCard>

            <InfoCard
              title="Interest Payment Frequency"
              condition={hasValue(bond.interestPaymentFrequency)}
            >
              {humanize(bond.interestPaymentFrequency)}
            </InfoCard>
            <InfoCard title="Day Convention" condition={hasValue(bond.dayConvention)}>
              {humanize(bond.dayConvention)}
            </InfoCard>

            {/* ── Dates ──────────────────────────────────────────────── */}
            <InfoCard title="Allotment Date" condition={hasValue(formatDate(bond.dateOfAllotment))}>
              {formatDate(bond.dateOfAllotment)}
            </InfoCard>
            <InfoCard title="Maturity Date" condition={hasValue(formatDate(bond.maturityDate))}>
              {formatDate(bond.maturityDate)}
            </InfoCard>

            <InfoCard title="Next Interest Payment Date" condition={hasValue(formatDate(bond.nextCouponDate))}>
              {formatDate(bond.nextCouponDate as string)}
            </InfoCard>


            {/* ── Classification ─────────────────────────────────────── */}
            <InfoCard title="Bond Category" condition={hasValue(category)}>
              <span className="capitalize">{category}</span>
            </InfoCard>
            <InfoCard title="Sector" condition={hasValue(bond.sectorName)}>
              <span className="capitalize">{bond.sectorName}</span>
            </InfoCard>
            <InfoCard title="Bond Type" condition={hasValue(bond.bondType)}>
              {humanize(bond.bondType)}
            </InfoCard>

            <InfoCard title="Seniority" condition={hasValue(bond.seniority)}>
              {humanize(bond.seniority)}
            </InfoCard>
            <InfoCard title="Security" condition={hasValue(security)}>
              {security}
            </InfoCard>

            <InfoCard title="Mode of Issuance" condition={hasValue(bond.modeOfIssuance)}>
              {String(bond.modeOfIssuance)}
            </InfoCard>
            <InfoCard title="Tax Status" condition={hasValue(taxStatus)}>
              {taxStatus}
            </InfoCard>
            <InfoCard title="Perpetual" condition={typeof bond.isPerpetual === "boolean"}>
              {yesNo(bond.isPerpetual)}
            </InfoCard>
            <InfoCard title="Listed" condition={hasValue(bond.isListed)}>
              {yesNo(bond.isListed)}
            </InfoCard>


            {/* ── Rating ─────────────────────────────────────────────── */}

            {/* ── Put / Call ─────────────────────────────────────────── */}
            <InfoCard title="Put" condition={hasValue(putText)}>
              <span className="flex items-center gap-1">
                {clip(putText, 15)}
                {putText.length > 15 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FaInfoCircle className="cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-wrap max-w-48">{putText}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </span>
            </InfoCard>
            <InfoCard title="Call" condition={hasValue(callText)}>
              <span className="flex items-center gap-1 line-clamp-1">
                {clip(callText, 15)}
                {callText.length > 15 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FaInfoCircle className="cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-wrap max-w-48">{callText}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </span>
            </InfoCard>
          </div>



          {bond && session && canShowBuyNow(bond) && (
            (() => {
              const kycOk = isKycVerified(session.kycStatus);
              const kraOk = isKraVerified(session.kraStatus);

              if (kycOk && kraOk) {
                return (
                  <div className="flex justify-center mt-8">
                    <Link href={`/place-order/${bond.isin}`}>
                      <Button className="px-8 py-2.5 bg-[#002a54] text-white hover:bg-[#001e3d] text-base font-semibold rounded-md transition-all shadow-sm hover:shadow active:scale-95 duration-200">
                        Buy This Bond
                      </Button>
                    </Link>
                  </div>
                );
              }

              return (
                <div className="border border-[#FDE047] rounded-xl py-6 px-8 bg-[#FFFBEB] text-center mx-auto mt-8 flex flex-col items-center justify-center gap-4 transition-all shadow-sm">
                  <p className="text-[#1F2937] text-sm md:text-[15px] font-medium leading-relaxed">
                    You&apos;re just one step away from investing in this bond. Complete your KYC to proceed with order placement.
                  </p>
                  <Link href="/dashboard/kyc">
                    <Button className="px-8 py-2.5 bg-[#E14F26] text-white hover:bg-[#C93F1B] text-base font-semibold rounded-md transition-all shadow-sm hover:shadow active:scale-95 duration-200">
                      Complete KYC
                    </Button>
                  </Link>
                </div>
              );
            })()
          )}
        </div>
      </div>

      <div className="container">
        <SectionWrapper>
          <BondsByCategories />
        </SectionWrapper>
      </div>
    </div>
  );
}