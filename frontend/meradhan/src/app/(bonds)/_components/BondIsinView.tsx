import BondsByCategories from "@/global/components/Bond/BondsByCategories";
import { SortInfoBox } from "@/global/components/wrapper/cards/SortInfoBox";
import { formatNumberTS } from "@/global/utils/formate";
import { BondDetailResponse } from "@root/apiGateway";
import { PiCurrencyInrBold } from "react-icons/pi";
import BondInfoHeader from "./BondInfoHeader";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import { dateTimeUtils } from "@/global/utils/datetime.utils";

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
            <SortInfoBox title="Yield">Coming Soon</SortInfoBox>
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
              {bond.categories?.[0] == "n/a" ? (
                "Coming Soon"
              ) : (
                <span className="capitalize">
                  {bond.categories?.[0] || "Coming Soon"}
                </span>
              )}
            </SortInfoBox>
            <SortInfoBox title="Interest Payment">
              {dateTimeUtils.formatDateTime(
                bond.interestPaymentMode,
                "DD MMM YYYY"
              )}
            </SortInfoBox>
            <SortInfoBox title="Coupon Type">Coming Soon</SortInfoBox>
            <SortInfoBox title="Taxable">
              {bond.taxStatus == "TAXABLE"
                ? "Yes"
                : bond.taxStatus == "TAX_FREE"
                ? "No"
                : "Coming Soon"}
            </SortInfoBox>
            <SortInfoBox title="Put">{"Coming Soon"}</SortInfoBox>
            <SortInfoBox title="Call"> {"Coming Soon"} </SortInfoBox>
            <SortInfoBox title="Mode of issuance">Coming Soon</SortInfoBox>
            <SortInfoBox title="Security">{isSecured()}</SortInfoBox>
            <SortInfoBox title="Issue Size">
              <PiCurrencyInrBold /> {formatNumberTS(bond.issuePrice)}
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
