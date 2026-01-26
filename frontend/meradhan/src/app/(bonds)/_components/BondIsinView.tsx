import BondsByCategories from "@/global/components/Bond/BondsByCategories";
import { SortInfoBox } from "@/global/components/wrapper/cards/SortInfoBox";
import { formatNumberTS } from "@/global/utils/formate";
import { BondDetailResponse } from "@root/apiGateway";
import { PiCurrencyInrBold } from "react-icons/pi";
import BondInfoHeader from "./BondInfoHeader";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import BondBuyNowCalc from "./BondBuyNowCalc";
import { FaInfoCircle } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BondIsinView({
  bond,
}: {
  bond: BondDetailResponse["responseData"];
}) {
  const isSecured = () => {
    if (bond.instrumentName.includes("UNSECURED")) {
      return "Unsecured";
    } else if (bond.instrumentName.includes("SECURED")) {
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
            <SortInfoBox title="Coupon Rate">{bond.couponRate}%</SortInfoBox>
            <SortInfoBox title="Yield">{bond.yield !== null && bond.yield !== undefined ? `${bond.yield}%` : "Coming Soon"}</SortInfoBox>
            <SortInfoBox title="Last Traded Yield">Coming Soon</SortInfoBox>
            <SortInfoBox title="Last Traded Price">Coming Soon</SortInfoBox>
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
            <SortInfoBox title="Coupon Type">Coming Soon</SortInfoBox>
            <SortInfoBox title="Taxable">
              {bond.taxStatus == "TAXABLE"
                ? "Yes"
                : bond.taxStatus == "TAX_FREE"
                  ? "No"
                  : "Coming Soon"}
            </SortInfoBox>

            <SortInfoBox title="Put">
              <p className="flex items-center gap-1">
                {pickWordsByMinLength(
                  bond.putCallOptionDetails
                    ?.split("Call:")?.[0]
                    .replace("Put:", "")
                    .trim() || "N/A",
                  15
                )}

                {(
                  bond.putCallOptionDetails
                    ?.split("Call:")?.[0]
                    .replace("Put:", "")
                    .trim() || ""
                ).length > 15 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FaInfoCircle className="cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-wrap max-w-48">
                          {bond.putCallOptionDetails
                            ?.split("Call:")?.[0]
                            .replace("Put:", "")
                            .trim()}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
              </p>
            </SortInfoBox>
            <SortInfoBox title="Call">
              <p className="flex items-center gap-1 line-clamp-1">
                {pickWordsByMinLength(
                  bond.putCallOptionDetails?.split("Call:")?.[1].trim() ||
                  "N/A",
                  15
                )}

                {(bond.putCallOptionDetails?.split("Call:")?.[1].trim() || "")
                  .length > 15 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FaInfoCircle className="cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-wrap max-w-48">
                          {bond.putCallOptionDetails?.split("Call:")?.[1].trim()}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
              </p>
            </SortInfoBox>
            <SortInfoBox title="Mode of issuance">Coming Soon</SortInfoBox>
            <SortInfoBox title="Security">{isSecured()}</SortInfoBox>
            <SortInfoBox title="Issue Size">
              <PiCurrencyInrBold /> {formatNumberTS(bond.totalIssueSize || 0)}
            </SortInfoBox>
            <SortInfoBox title="Next Interest Payment Date">
              Coming Soon
            </SortInfoBox>
          </div>
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
