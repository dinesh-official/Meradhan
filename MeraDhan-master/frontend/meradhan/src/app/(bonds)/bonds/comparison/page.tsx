import apiServerCaller from "@/core/connection/apiServerCaller";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import apiGateway, { BondDetailResponse } from "@root/apiGateway";
import { redirect } from "next/navigation";
import { BsInfoCircleFill } from "react-icons/bs";
import CopyIsin from "./_comparison/CopyIsin";
import DeleteCompare from "./_comparison/DeleteCampare";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";

export const revalidate = 0;

export const generateMetadata = async () => {
  return await generatePagesMetaData("bonds/comparison");
};

async function page({
  searchParams,
}: {
  searchParams: Promise<{ bonds: string }>;
}) {
  const { bonds } = await searchParams;

  const bondArray: string[] = JSON.parse(bonds || "[]");
  if (!bondArray || bondArray.length < 1) {
    redirect("/404");
    return null;
  }

  const apiProvider = new apiGateway.bondsApi.BondsApi(apiServerCaller);

  async function fetchBondDetails(isin: string) {
    const data = await apiProvider.getBondDetailsByIsin(isin);
    return data.responseData;
  }

  const bondsData = await Promise?.all(
    bondArray.map(async (e) => await fetchBondDetails(e))
  );

  const BondRow = ({
    label,
    values,
    hasInfoIcon = false,
    noBorder = false,
  }: {
    label: string;
    values: React.ReactNode[];
    hasInfoIcon?: boolean;
    noBorder?: boolean;
  }) => (
    <div
      className={`w-full flex items-center h-full ${
        noBorder ? "" : "border-t border-gray-200"
      }`}
    >
      <div className="p-3 w-2/12">
        <span className="flex items-center gap-3">
          {label}{" "}
          {hasInfoIcon && <BsInfoCircleFill size={14} color="#AAAAAA" />}
        </span>
      </div>
      {values.map((val, idx) => (
        <div
          key={idx}
          className="flex flex-1 justify-between items-center gap-2 p-3"
        >
          {val}
        </div>
      ))}
    </div>
  );

  return (
    <ViewPort>
      <div className="container">
        <div className="">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Bonds</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Comparison</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="pt-5 lg:pt-10 pb-5">
          <h1 className={cn("text-3xl md:text-4xl quicksand-medium")}>
            Bonds{" "}
            <span className="font-semibold text-secondary">Comparison</span>
          </h1>
        </div>
        <div className="mb-10 overflow-x-auto">
          <div className="w-full min-w-[1200px]">
            <div className="bg-white border-gray-200 border-t overflow-hidden">
              {/* Issuer */}
              <div className="flex w-full h-full">
                <div className="p-3 w-2/12">
                  <p className="font-medium text-gray-700">Issuer</p>
                </div>
                {bondsData.map((bond, i) => (
                  <div
                    key={i}
                    className="flex flex-1 justify-between items-start gap-5 p-3"
                  >
                    <span className="font-semibold text-lg">
                      {bond?.bondName}
                    </span>
                    {/* <Image src='/demo/defaultlogo 1.png' alt='bonds' width={50} height={50} /> */}
                  </div>
                ))}
              </div>

              {/* Security Name */}
              {/* <BondRow
              label='Security Name'
              values={bondsData.map((bond) => (
                <p >{bond?.instrument_name}</p>
              ))}
            /> */}

              {/* ISIN */}
              <BondRow
                label="ISIN"
                values={bondsData.map((bond, i) => (
                  <>
                    <div
                      className="flex justify-between items-center gap-2"
                      key={"isin" + i}
                    >
                      <span>{bond?.isin}</span>
                      <CopyIsin isin={bond?.isin} />
                    </div>
                    <DeleteCompare index={i} />
                  </>
                ))}
              />

              {/* Yield Offered */}
              <BondRow
                label="Yield Offered"
                hasInfoIcon
                values={bondsData.map((bond) => (
                  // <b>{parseFloat(bond?.coupon + '') + 1.37 /* example math */} %</b>
                  <p key={bond.isin}>Coming Soon</p>
                ))}
              />
              {/* Price Offered */}
              <BondRow
                label="Price Offered"
                hasInfoIcon
                values={bondsData.map(
                  (val: BondDetailResponse["responseData"], i) => (
                    <span key={"price" + i}>
                      <i className="text-base fa-solid fa-indian-rupee-sign"></i>{" "}
                      {val?.issuePrice?.toFixed(2)}
                    </span>
                  )
                )}
              />

              {/* Buy Now Buttons */}
              {/* <BondRow
                label=""
                noBorder
                values={bondsData.map((_, i) => (
                  <button
                    className="bg-primary hover:bg-primary px-4 py-2 rounded-lg w-full text-white transition-colors"
                    key={"buy" + i}
                  >
                    Buy Now
                  </button>
                ))}
              /> */}

              {/* Coupon */}
              <BondRow
                label="Coupon"
                values={bondsData.map((bond, i) => (
                  <span key={"coupon" + i}>
                    {bond?.couponRate.toFixed(4)} % P.A
                  </span>
                ))}
              />

              {/* Face Value */}
              <BondRow
                label="Face Value"
                values={bondsData.map((bond) => (
                  <span key={bond?.isin}>
                    <i className="text-base fa-solid fa-indian-rupee-sign"></i>{" "}
                    {bond?.faceValue?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                ))}
              />

              {/* IP Frequency */}
              <BondRow
                label="IP Frequency"
                values={bondsData.map((bond, i) => (
                  <span key={"ipFrequency" + i}>
                    {bond?.interestPaymentMode.replaceAll("_", " ")}
                  </span>
                ))}
              />

              {/* Call/Put Date */}
              <BondRow
                label="Call/Put Date"
                values={bondsData.map(
                  (e: BondDetailResponse["responseData"], i) => (
                    <span key={"putCallOptionDetails" + i}>
                      {e?.putCallOptionDetails || "-"}
                    </span>
                  )
                )}
              />

              {/* Maturity Date */}
              <BondRow
                label="Maturity Date"
                values={bondsData.map((bond, i) => (
                  <span key={"maturityDate" + i}>
                    {dateTimeUtils.formatDateTime(
                      bond?.redemptionDate,
                      "DD/MM/YYYY"
                    )}
                  </span>
                ))}
              />

              {/* Rating */}
              <BondRow
                label="Rating"
                values={bondsData.map((bond) => (
                  <span key={bond?.isin}>
                    {bond?.creditRating == "UnRated"
                      ? "Coming Soon"
                      : bond?.creditRating}
                  </span>
                ))}
              />

              {/* Taxation */}
              <BondRow
                label="Taxation"
                values={bondsData.map((bond) => (
                  <span key={bond.isin}>
                    {bond?.taxStatus.toUpperCase() === "UNKNOWN"
                      ? "Coming Soon"
                      : bond?.taxStatus}
                  </span>
                ))}
              />

              {/* Security */}
              <BondRow
                label="Security"
                values={bondsData.map(
                  (val: BondDetailResponse["responseData"], i) => (
                    <span key={"security" + i}>
                      {val?.instrumentName?.includes("SECURED")
                        ? "SECURED"
                        : "UNSECURED"}
                    </span>
                  )
                )}
              />

              {/* Coupon Type */}
              <BondRow
                label="Coupon Type"
                values={bondsData.map(
                  (val: BondDetailResponse["responseData"], i) => (
                    <span key={"couponType" + i}>Coming Soon</span>
                  )
                )}
              />

              {/* Issue Date */}
              <BondRow
                label="Issue Date"
                values={bondsData.map((bond, i) => (
                  <span key={"issueDate" + i}>
                    {dateTimeUtils.formatDateTime(
                      bond?.dateOfAllotment,
                      "DD/MM/YYYY"
                    )}
                  </span>
                ))}
              />

              {/* Buy Buttons Again */}
              {/* <BondRow
                label=""
                noBorder
                values={bondsData.map((_, i) => (
                  <button
                    className="bg-primary hover:bg-primary px-4 py-2 rounded-lg w-full text-white transition-colors"
                    key={"buy2" + i}
                  >
                    Buy Now
                  </button>
                ))}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
