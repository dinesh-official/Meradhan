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

export default function BondIsinView({
  bond,
  session,
}: {
  bond: BondDetailResponse["responseData"];
  session?: ISessionResponse["responseData"] | null;
}) {
  const TAX_STATUS_LABELS: Record<string, string> = {
    TAXABLE: "Taxable",
    TAX_FREE: "Tax Free",
    TAX_SAVING: "Tax Saving",
    TAX_EXEMPTION: "Tax Exemption",
  };

  const putText =
    bond.putCallOptionDetails
      ?.split("Call:")?.[0]
      ?.replace("Put:", "")
      ?.trim() ?? "";

  const callText = bond.putCallOptionDetails?.split("Call:")?.[1]?.trim() ?? "";

  const securedValue = (() => {
    if (bond.natureOfInstrument?.includes("UNSECURED")) return "Unsecured";
    if (bond.natureOfInstrument?.includes("SECURED")) return "Secured";
    return null;
  })();

  function pickWordsByMinLength(text: string, minLength: number): string {
    const words = text.trim().split("");
    if (words.length <= minLength) return text;
    return words.slice(0, minLength).join("") + "...";
  }

  const formateCategory = (category: string) => {
    const cat = ["nbfc", "psu"];
    if (cat.includes(category.toLowerCase())) return category.toUpperCase();
    return category;
  };

  const firstCategory = bond.categories?.[0];
  const hasCategory = !!firstCategory && firstCategory.toLowerCase() !== "n/a";

  const taxStatusLabel = bond.taxStatus ? TAX_STATUS_LABELS[bond.taxStatus] : undefined;
  const hasTaxStatus = !!taxStatusLabel;

  return (
    <div className="py-10">
      <BondInfoHeader bond={bond} />
      <div className="gap-8 grid lg:grid-cols-3 py-10">
        <div className="lg:col-span-3">
          <div className="gap-5 grid md:grid-cols-3">
            <SortInfoBox title="Issue Price" hide={bond.issuePrice === null || bond.issuePrice === undefined}>
              <PiCurrencyInrBold /> {formatNumberTS(bond.issuePrice)}
            </SortInfoBox>
            <SortInfoBox title="Face Value" hide={bond.faceValue === null || bond.faceValue === undefined}>
              <PiCurrencyInrBold /> {formatNumberTS(bond.faceValue)}
            </SortInfoBox>
            <SortInfoBox title="Coupon Rate" hide={bond.couponRate === null || bond.couponRate === undefined}>
              {`${Number(bond.couponRate).toFixed(2)}%`}
            </SortInfoBox>
            <SortInfoBox title="Yield" hide={bond.yield === null || bond.yield === undefined}>
              {`${Number(bond.yield).toFixed(2)}%`}
            </SortInfoBox>
            <SortInfoBox title="Last Traded Yield" hide={bond.lastTradeYield === null || bond.lastTradeYield === undefined}>
              {`${Number(bond.lastTradeYield).toFixed(2)}%`}
            </SortInfoBox>
            <SortInfoBox title="Last Traded Price" hide={bond.lastTradePrice === null || bond.lastTradePrice === undefined}>
              <PiCurrencyInrBold /> {formatNumberTS(bond.lastTradePrice ?? 0)}
            </SortInfoBox>
            <SortInfoBox title="Allotment Date" hide={!bond.dateOfAllotment}>
              {dateTimeUtils.formatDateTime(bond.dateOfAllotment, "DD MMM YYYY")}
            </SortInfoBox>
            <SortInfoBox title="Maturity Date" hide={!bond.maturityDate}>
              {dateTimeUtils.formatDateTime(bond.maturityDate, "DD MMM YYYY")}
            </SortInfoBox>
            <SortInfoBox title="Bond Category" hide={!hasCategory}>
              <span className="capitalize">{formateCategory(firstCategory || "")}</span>
            </SortInfoBox>
            <SortInfoBox title="Interest Payment" hide={!bond.interestPaymentMode}>
              {bond.interestPaymentMode?.replaceAll("_", " ")}
            </SortInfoBox>
            <SortInfoBox title="Coupon Type" hide={bond.couponType === null || bond.couponType === undefined}>
              {bond.couponType}
            </SortInfoBox>
            <SortInfoBox title="Tax Status" hide={!hasTaxStatus}>
              {taxStatusLabel}
            </SortInfoBox>
            <SortInfoBox title="Put" hide={!putText}>
              <p className="flex items-center gap-1">
                {pickWordsByMinLength(putText, 15)}
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
              </p>
            </SortInfoBox>
            <SortInfoBox title="Call" hide={!callText}>
              <p className="flex items-center gap-1 line-clamp-1">
                {pickWordsByMinLength(callText, 15)}
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
              </p>
            </SortInfoBox>
            <SortInfoBox title="Mode of issuance" hide={bond.modeOfIssuance === null || bond.modeOfIssuance === undefined}>
              {bond.modeOfIssuance}
            </SortInfoBox>
            <SortInfoBox title="Security" hide={!securedValue}>
              {securedValue}
            </SortInfoBox>
            <SortInfoBox title="Issue Size" hide={!bond.totalIssueSize}>
              <PiCurrencyInrBold /> {formatNumberTS(bond.totalIssueSize || 0)}
            </SortInfoBox>
            <SortInfoBox title="Next Interest Payment Date" hide={bond.nextCouponDate === null || bond.nextCouponDate === undefined}>
              {dateTimeUtils.formatDateTime(bond.nextCouponDate, "DD MMM YYYY")}
            </SortInfoBox>
          </div>

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
        {/* <div className="lg:col-span-2">
          <BondBuyNowCalc />
        </div> */}
      </div>

      <div className="container">
        <SectionWrapper>
          <BondsByCategories />
        </SectionWrapper>
      </div>
    </div>
  );
}
