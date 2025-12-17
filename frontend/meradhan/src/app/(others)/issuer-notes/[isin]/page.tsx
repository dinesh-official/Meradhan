import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { FaCalendarAlt, FaClock, FaEye, FaStar } from "react-icons/fa";
import { RiShareFill } from "react-icons/ri";
import IsshuerNotesAddToWatchList from "../_components/IsshuerNotesAddToWatchList";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { SortInfoBox } from "@/global/components/wrapper/cards/SortInfoBox";
import {
  fetchIssuerNotesBySlugGql,
  fetchIssuerNotesMetaData,
  incrementIssuerNoteViews,
} from "../_action/issuerNotesAction";
import {
  calculateReadTime,
  dateTimeUtils,
} from "@/global/utils/datetime.utils";
import { redirect } from "next/navigation";
import { getRatingColor } from "@/global/components/Bond/CreaditRatingBadge";
import { CMS_URL, HOST_URL } from "@/global/constants/domains";
import { SharePopupTrigger } from "@/global/module/share/SharePopupView";
import ImageSlider from "../_components/ImageSlider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PiCurrencyInrBold } from "react-icons/pi";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";

export const revalidate = 0; // Revalidate the page every hour
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ isin: string }>;
}) => {
  return fetchIssuerNotesMetaData((await params).isin);
};

async function page({ params }: { params: Promise<{ isin: string }> }) {
  const data = await fetchIssuerNotesBySlugGql((await params).isin);
  if (!data?.data?.Slug) {
    return redirect("/404");
  }
  await incrementIssuerNoteViews(
    data.data.documentId,
    (data.data.Views || 0) + 1
  );

  return (
    <ViewPort>
      <div className="container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/issuer-notes">Issuer Notes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data?.data?.Issuer_Name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="py-14">
          <div className="flex flex-col gap-5">
            {/* date actions  */}
            <div className="flex flex-wrap lg:flex-nowrap justify-between items-center gap-5">
              <div className="flex justify-between lg:justify-start items-center gap-8 w-full lg:w-auto">
                <div className="flex items-center gap-2 text-gray-500">
                  <div>
                    <FaCalendarAlt size={18} />
                  </div>
                  <p>
                    {dateTimeUtils.formatDateTime(
                      data!.data!.createdAt,
                      "DD MMM YYYY"
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FaClock size={18} />{" "}
                  <p>
                    {calculateReadTime(
                      (data?.data?.Content?.Introduction || "") +
                        (data?.data?.Content?.Content_1 || "") +
                        (data?.data?.Content?.Content_2 || "")
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FaEye size={18} /> <p>{data.data.Views || 0}</p>
                </div>
              </div>
              <div className="flex justify-between lg:justify-end items-center gap-5 w-full lg:w-auto">
                <IsshuerNotesAddToWatchList issuerId={data.data.documentId} />
                <SharePopupTrigger
                  title={"Share Issuer Note"}
                  url={HOST_URL + "/issuer-notes/" + data?.data?.Slug}
                >
                  <div className="flex items-center gap-2 bg-secondary p-1 rounded-md text-white cursor-pointer">
                    <RiShareFill size={16} />
                  </div>
                </SharePopupTrigger>
              </div>
            </div>
            {/* title logo  */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex flex-col gap-5">
                <h1
                  className={cn(
                    "font-medium lg:text-[44px]",
                    "quicksand-medium text-2xl"
                  )}
                >
                  {data?.data?.Issuer_Name}
                </h1>

                <div className="flex items-center gap-5">
                  <div
                    className="flex items-center gap-3  px-5 py-2 rounded-lg text-white"
                    style={{
                      backgroundColor: getRatingColor(
                        data?.bondDetails?.creditRating || ""
                      ),
                    }}
                  >
                    <FaStar /> <p>{data?.bondDetails?.creditRating}</p>
                  </div>
                  <p className="text-gray-600">{data?.bondDetails?.bondName}</p>
                </div>
              </div>
              <div>
                <Image
                  src={CMS_URL + data?.data?.Logo?.url}
                  width={200}
                  height={200}
                  alt="No found"
                  className="p-3 border border- border-gray-200 rounded-lg w-28 h-auto object-contain aspect-square"
                />
              </div>
            </div>
            {/* // cards  */}
            <div className="gap-5 grid md:grid-cols-4">
              <SortInfoBox title="Coupon">
                {data?.bondDetails?.couponRate
                  ? data?.bondDetails?.couponRate.toFixed(2) + "%"
                  : "--"}
              </SortInfoBox>
              <SortInfoBox title="Yield">--</SortInfoBox>
              <SortInfoBox title="Maturity Date">
                {data?.bondDetails?.maturityDate
                  ? dateTimeUtils.formatDateTime(
                      data?.bondDetails?.maturityDate,
                      "DD MMM YYYY"
                    )
                  : "--"}
              </SortInfoBox>
              <SortInfoBox title="ISIN">
                {data?.bondDetails?.isin || "--"}
              </SortInfoBox>
            </div>
          </div>

          {/* // content  */}
          <div className="flex flex-col">
            <div
              className="article"
              dangerouslySetInnerHTML={{
                __html: sanitizeStrapiHTML(data?.data?.Content?.Introduction),
              }}
            ></div>
            <div
              className="article"
              dangerouslySetInnerHTML={{
                __html: sanitizeStrapiHTML(data?.data?.Content?.Content_1),
              }}
            ></div>{" "}
            <ImageSlider
              imaeges={data.data.Images.map((e) => CMS_URL + e.url)}
            />
            <div
              className="article"
              dangerouslySetInnerHTML={{
                __html: sanitizeStrapiHTML(data?.data?.Content?.Content_2),
              }}
            ></div>
            <div>
              {/* // cards  */}
              <p className="mb-3 quicksand-semibold text-xl lg:text-[28px]">
                Instrument Details
              </p>
              <div className="gap-5 grid md:grid-cols-4">
                <SortInfoBox title="Seniority">--</SortInfoBox>
                <SortInfoBox title="Rating">
                  {data.bondDetails.creditRating}
                </SortInfoBox>
                <SortInfoBox title="Face Value">
                  <PiCurrencyInrBold />{" "}
                  {data.bondDetails.faceValue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </SortInfoBox>
                <SortInfoBox title="Issue Date">
                  {" "}
                  {data?.bondDetails?.dateOfAllotment
                    ? dateTimeUtils.formatDateTime(
                        data?.bondDetails?.dateOfAllotment,
                        "DD MMM YYYY"
                      )
                    : "--"}
                </SortInfoBox>
                <SortInfoBox title="Maturity Date">
                  {data?.bondDetails?.maturityDate
                    ? dateTimeUtils.formatDateTime(
                        data?.bondDetails?.maturityDate,
                        "DD MMM YYYY"
                      )
                    : "--"}
                </SortInfoBox>
                <SortInfoBox title="Payment Frequency">
                  {data.bondDetails.interestPaymentFrequency || "--"}
                </SortInfoBox>
                <SortInfoBox title="Taxation">
                  {data.bondDetails.taxStatus != "UNKNOWN"
                    ? data.bondDetails.taxStatus || "--"
                    : "--"}
                </SortInfoBox>
                <SortInfoBox title="Coupon Type">--</SortInfoBox>
                <SortInfoBox title="Security">
                  {data.bondDetails.instrumentName
                    .toLowerCase()
                    .includes(" secured ")
                    ? "Secured"
                    : "--"}
                </SortInfoBox>
                <SortInfoBox title="Redemption Amount">--</SortInfoBox>
                <SortInfoBox title="Listing">--</SortInfoBox>
                <SortInfoBox title="Mode of Issue">--</SortInfoBox>
              </div>
            </div>
            <div className="mt-14">
              <p className="mb-3 text-xl lg:text-[28px] quicksand-semibold ">
                Frequently Asked Questions
              </p>
              <Accordion
                type="single"
                collapsible
                defaultValue="item-0"
                className="mt-5"
              >
                {data.data.Faqs.map((faq, i) => (
                  <AccordionItem
                    key={faq.id}
                    value={`item-${i}`}
                    className="border-b-0"
                  >
                    <AccordionTrigger className="quicksand-semibold">
                      {faq.Question}
                    </AccordionTrigger>
                    <AccordionContent>{faq.Answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
