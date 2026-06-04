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
  const putText =
    bond.putCallOptionDetails
      ?.split("Call:")?.[0]
      ?.replace("Put:", "")
      ?.trim() ?? "";

  const callText = bond.putCallOptionDetails?.split("Call:")?.[1]?.trim() ?? "";

  const isSecured = () => {
    if (bond.natureOfInstrument?.includes("UNSECURED")) {
      return "Unsecured";
    } else if (bond.natureOfInstrument?.includes("SECURED")) {
      return "Secured";
    }
    return "-";
  };
  function pickWordsByMinLength(text: string, minLength: number): string {
    const words = text.trim().split("");

    if (words.length <= minLength) return text;

    return words.slice(0, minLength).join("") + "...";
  }

  const formateCategory = (category: string) => {
    if (bond.categories?.[0] == "n/a") {
      return "Coming Soon";
    }

    const cat = ["nbfc", "psu"];

    if (cat.includes(category.toLowerCase())) {
      return category.toUpperCase();
    }

    return category;
  };

  return (
    <div className="py-10">
      <BondInfoHeader bond={bond} />
      <div className="gap-8 grid lg:grid-cols-3 py-10">
        <div className="lg:col-span-3">
          <div className="gap-5 grid md:grid-cols-3">
            <SortInfoBox title="Issue Price">
              <PiCurrencyInrBold /> {formatNumberTS(bond.issuePrice)}
            </SortInfoBox>
            <SortInfoBox title="Face Value">
              <PiCurrencyInrBold /> {formatNumberTS(bond.faceValue)}
            </SortInfoBox>
            <SortInfoBox title="Coupon Rate">{bond.couponRate !== null && bond.couponRate !== undefined ? `${Number(bond.couponRate).toFixed(2)}%` : "Coming Soon"}</SortInfoBox>
            <SortInfoBox title="Yield">{bond.yield !== null && bond.yield !== undefined ? `${Number(bond.yield).toFixed(2)}%` : "Coming Soon"}</SortInfoBox>
            <SortInfoBox title="Last Traded Yield">{bond.lastTradeYield !== null && bond.lastTradeYield !== undefined ? `${Number(bond.lastTradeYield).toFixed(2)}%` : "Coming Soon"}</SortInfoBox>
            <SortInfoBox title="Last Traded Price">
              {bond.lastTradePrice !== null && bond.lastTradePrice !== undefined ? (
                <>
                  <PiCurrencyInrBold /> {formatNumberTS(bond.lastTradePrice)}
                </>
              ) : (
                "Coming Soon"
              )}
            </SortInfoBox>
            <SortInfoBox title="Allotment Date">
              {dateTimeUtils.formatDateTime(
                bond.dateOfAllotment,
                "DD MMM YYYY"
              )}
            </SortInfoBox>
            <SortInfoBox title="Maturity Date">
              {dateTimeUtils.formatDateTime(bond.maturityDate, "DD MMM YYYY")}
            </SortInfoBox>
            <SortInfoBox title="Bond Category">
              <span className="capitalize" >{formateCategory(bond.categories?.[0] || "")}</span>
            </SortInfoBox>

            <SortInfoBox title="Interest Payment">
              {bond.interestPaymentMode?.replaceAll("_", " ") || "Coming Soon"}
            </SortInfoBox>
            <SortInfoBox title="Coupon Type">{bond.couponType !== null && bond.couponType !== undefined ? bond.couponType : "Coming Soon"}</SortInfoBox>
            <SortInfoBox title="Taxable">
              {bond.taxStatus !== null && bond.taxStatus !== undefined && bond.taxStatus == "TAXABLE"
                ? "Yes"
                : bond.taxStatus !== null && bond.taxStatus !== undefined && bond.taxStatus == "TAX_FREE"
                  ? "No"
                  : "Coming Soon"}
            </SortInfoBox>

            <SortInfoBox title="Put">
              <p className="flex items-center gap-1">
                {pickWordsByMinLength(
                  putText || "N/A",
                  15
                )}

                {putText.length > 15 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FaInfoCircle className="cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-wrap max-w-48">
                        {putText}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </p>
            </SortInfoBox>
            <SortInfoBox title="Call">
              <p className="flex items-center gap-1 line-clamp-1">
                {pickWordsByMinLength(
                  callText || "N/A",
                  15
                )}

                {callText.length > 15 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FaInfoCircle className="cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-wrap max-w-48">
                        {callText}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </p>
            </SortInfoBox>
            <SortInfoBox title="Mode of issuance">{bond.modeOfIssuance !== null && bond.modeOfIssuance !== undefined ? bond.modeOfIssuance : "Coming Soon"}</SortInfoBox>
            <SortInfoBox title="Security">{isSecured()}</SortInfoBox>
            <SortInfoBox title="Issue Size">
              <PiCurrencyInrBold /> {formatNumberTS(bond.totalIssueSize || 0)}
            </SortInfoBox>
            <SortInfoBox title="Next Interest Payment Date">
              {bond.nextCouponDate !== null && bond.nextCouponDate !== undefined ? dateTimeUtils.formatDateTime(bond.nextCouponDate, "DD MMM YYYY") : "Coming Soon"}
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
