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

function deriveTaxable(taxStatus: string | null | undefined): string {
  if (!taxStatus) return "";
  const t = taxStatus.toUpperCase();
  if (t === "TAXABLE") return "Yes";
  if (t === "TAX_FREE") return "No";
  return taxStatus;
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
  const taxable = deriveTaxable(bond.taxStatus);
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
            <InfoCard title="Buy Price" condition={hasValue(bond.buyPrice, { hideIfZero: true })}>
              <PiCurrencyInrBold /> {formatNumberTS(bond.buyPrice ?? 0)}
            </InfoCard>
            <InfoCard title="Sell Price" condition={hasValue(bond.sellPrice, { hideIfZero: true })}>
              <PiCurrencyInrBold /> {formatNumberTS(bond.sellPrice ?? 0)}
            </InfoCard>
            <InfoCard title="Last Traded Price" condition={hasValue(bond.lastTradePrice, { hideIfZero: true })}>
              <PiCurrencyInrBold /> {formatNumberTS(bond.lastTradePrice as number)}
            </InfoCard>
            <InfoCard title="Stamp Duty" condition={hasValue(bond.stampDutyPercentage, { hideIfZero: true })}>
              {formatPercent(bond.stampDutyPercentage)}
            </InfoCard>
            <InfoCard
              title="CRM Available Quantity"
              condition={hasValue(bond.crmAvailableQuantity, { hideIfZero: true })}
            >
              {formatNumberTS(bond.crmAvailableQuantity ?? 0)}
            </InfoCard>

            {/* ── Yields & coupon ────────────────────────────────────── */}
            <InfoCard title="Coupon Rate" condition={hasValue(bond.couponRate, { hideIfZero: true })}>
              {formatPercent(bond.couponRate)}
            </InfoCard>
            <InfoCard title="Yield" condition={hasValue(bond.yield, { hideIfZero: true })}>
              {formatPercent(bond.yield as number)}
            </InfoCard>
            <InfoCard title="Buy Yield" condition={hasValue(bond.buyYield, { hideIfZero: true })}>
              {formatPercent(bond.buyYield as number)}
            </InfoCard>
            <InfoCard title="Last Traded Yield" condition={hasValue(bond.lastTradeYield, { hideIfZero: true })}>
              {formatPercent(bond.lastTradeYield as number)}
            </InfoCard>
            <InfoCard title="Coupon Type" condition={hasValue(bond.couponType)}>
              {String(bond.couponType)}
            </InfoCard>
            <InfoCard title="Interest Payment Mode" condition={hasValue(bond.interestPaymentMode)}>
              {humanize(bond.interestPaymentMode)}
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
            <InfoCard title="Redemption Date" condition={hasValue(formatDate(bond.redemptionDate))}>
              {formatDate(bond.redemptionDate)}
            </InfoCard>
            <InfoCard title="Last Coupon Date" condition={hasValue(formatDate(bond.lastCouponDate))}>
              {formatDate(bond.lastCouponDate)}
            </InfoCard>
            <InfoCard title="Next Interest Payment Date" condition={hasValue(formatDate(bond.nextCouponDate))}>
              {formatDate(bond.nextCouponDate as string)}
            </InfoCard>
            <InfoCard title="Record Date" condition={hasValue(formatDate(bond.recordDate))}>
              {formatDate(bond.recordDate)}
            </InfoCard>
            <InfoCard title="Record Days" condition={hasValue(bond.recordDays)}>
              {bond.recordDays}
            </InfoCard>
            <InfoCard title="Rating Date" condition={hasValue(formatDate(bond.ratingDate))}>
              {formatDate(bond.ratingDate)}
            </InfoCard>
            <InfoCard title="Start Date" condition={hasValue(formatDate(bond.startDate))}>
              {formatDate(bond.startDate)}
            </InfoCard>
            <InfoCard title="End Date" condition={hasValue(formatDate(bond.endDate))}>
              {formatDate(bond.endDate)}
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
            <InfoCard title="Nature of Instrument" condition={hasValue(bond.natureOfInstrument)}>
              {humanize(bond.natureOfInstrument)}
            </InfoCard>
            <InfoCard title="Seniority" condition={hasValue(bond.seniority)}>
              {humanize(bond.seniority)}
            </InfoCard>
            <InfoCard title="Security" condition={hasValue(security)}>
              {security}
            </InfoCard>
            <InfoCard title="Redemption Type" condition={hasValue(bond.redemptionType)}>
              {humanize(bond.redemptionType)}
            </InfoCard>
            <InfoCard title="Mode of Issuance" condition={hasValue(bond.modeOfIssuance)}>
              {String(bond.modeOfIssuance)}
            </InfoCard>
            <InfoCard title="Taxable" condition={hasValue(taxable)}>
              {taxable}
            </InfoCard>
            <InfoCard title="Perpetual" condition={typeof bond.isPerpetual === "boolean"}>
              {yesNo(bond.isPerpetual)}
            </InfoCard>
            <InfoCard title="Listed" condition={hasValue(bond.isListed)}>
              {yesNo(bond.isListed)}
            </InfoCard>
            <InfoCard title="Exchange Listed On" condition={hasValue(bond.exchangeListedOn)}>
              {bond.exchangeListedOn}
            </InfoCard>

            {/* ── Rating ─────────────────────────────────────────────── */}
            <InfoCard title="Credit Rating" condition={hasValue(bond.creditRating)}>
              {bond.creditRating}
            </InfoCard>
            <InfoCard title="Rating Agency" condition={hasValue(bond.ratingAgencyName)}>
              {bond.ratingAgencyName}
            </InfoCard>

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

          {/* ── Long-text / document details ─────────────────────────── */}
          {hasAnyLongText && (
            <div className="mt-8 border rounded-lg p-5 bg-white">
              <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
              <DetailRow label="Registrar" condition={hasValue(bond.registrarDetails)}>
                {bond.registrarDetails}
              </DetailRow>
              <DetailRow label="Debenture Trustee" condition={hasValue(bond.debentureTrustee)}>
                {bond.debentureTrustee}
              </DetailRow>
              <DetailRow
                label="Physical Security Address"
                condition={hasValue(bond.physicalSecurityAddress)}
              >
                {bond.physicalSecurityAddress}
              </DetailRow>
              <DetailRow
                label="Defaulted in Redemption"
                condition={hasValue(bond.defaultedInRedemption)}
              >
                {bond.defaultedInRedemption}
              </DetailRow>
              <DetailRow label="Certificate Numbers" condition={hasValue(bond.certificateNumbers)}>
                {bond.certificateNumbers}
              </DetailRow>
              <DetailRow label="Remarks" condition={hasValue(bond.remarks)}>
                {bond.remarks}
              </DetailRow>
              <DetailRow label="Information Memorandum" condition={hasValue(bond.imDocumentLink)}>
                <a
                  href={bond.imDocumentLink ?? "#"}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-secondary underline"
                >
                  View document
                </a>
              </DetailRow>
              <DetailRow label="Provider" condition={hasValue(bond.providerName)}>
                {bond.providerName}
              </DetailRow>
              <DetailRow
                label="Provider Price"
                condition={hasValue(bond.providerPrice, { hideIfZero: true })}
              >
                ₹ {formatNumberTS(bond.providerPrice as number)}
              </DetailRow>
              <DetailRow
                label="Provider Quantity"
                condition={hasValue(bond.providerQuantity, { hideIfZero: true })}
              >
                {formatNumberTS(bond.providerQuantity as number)}
              </DetailRow>
              <DetailRow
                label="Provider Interest Date"
                condition={hasValue(formatDate(bond.providerInterestDate as string))}
              >
                {formatDate(bond.providerInterestDate as string)}
              </DetailRow>
            </div>
          )}

          {bond && canShowBuyNow(bond) && (
            (() => {
              const kycOk = session ? isKycVerified(session.kycStatus) : false;
              const kraOk = session ? isKraVerified(session.kraStatus) : false;

              if (session && kycOk && kraOk) {
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
