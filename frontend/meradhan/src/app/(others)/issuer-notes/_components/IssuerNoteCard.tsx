import { getRatingColor } from "@/global/components/Bond/CreaditRatingBadge";
import { CMS_URL, HOST_URL } from "@/global/constants/domains";
import { SharePopupTrigger } from "@/global/module/share/SharePopupView";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { FaStar } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import { IoShareSocialSharp } from "react-icons/io5";
import { fetchIssuerNotesGql } from "../_action/issuerNotesAction";

function InfoLabel({
  title,
  value,
}: {
  title?: string | ReactNode;
  value?: string | ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-gray-800">{title}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export function IssuerNoteCard({
  gridMode,
  data,
}: {
  gridMode?: boolean;
  data: Awaited<ReturnType<typeof fetchIssuerNotesGql>>["nodes"][number];
}) {
  return (
    <div
      className={cn(
        "w-full flex border lg:flex-row flex-col border-gray-200 p-5 px-6 rounded-lg lg:gap-10 gap-5",
        gridMode && "lg:flex-col gap-5"
      )}
    >
      <div className="  flex justify-between items-center  ">
        <Image
          src={
            CMS_URL + data?.Logo?.url || "/assets/issuer-note-placeholder.png"
          }
          width={200}
          height={200}
          alt="No found"
          className="min-w-16 w-20 h-auto"
        />
        <SharePopupTrigger
          title={"Share Issuer Note"}
          url={HOST_URL + "/issuer-notes/" + data?.Slug}
        >
          <IoShareSocialSharp
            size={22}
            className={gridMode ? "" : "lg:hidden block"}
          />
        </SharePopupTrigger>
      </div>
      <div className="w-full flex flex-col gap-5">
        <div className="flex justify-between items-center w-full">
          <h5
            className={cn(
              "text-2xl font-semibold text-primary",
              "quicksand-medium"
            )}
          >
            {data?.Issuer_Name}
          </h5>
          {!gridMode ? (
            <SharePopupTrigger
              title={"Share Issuer Note"}
              url={HOST_URL + "/issuer-notes/" + data?.Slug}
            >
              <IoShareSocialSharp size={22} className="lg:block hidden" />
            </SharePopupTrigger>
          ) : null}
        </div>

        <div
          className={cn(
            "flex justify-between  items-center lg:flex-row flex-col",
            gridMode && "lg:flex-col"
          )}
        >
          <div
            className={cn(
              "grid lg:grid-cols-4 grid-cols-2 gap-3 w-full",
              gridMode && "gap-5 lg:grid-cols-2 "
            )}
          >
            <InfoLabel
              title="Coupon %"
              value={(data?.bondData?.couponRate || 0).toFixed(2) + "%"}
            />
            <InfoLabel title="Yield" value={"--"} />
            <InfoLabel
              title={
                <div className="flex items-center gap-2">
                  Maturity Date <Calendar size={10} />
                </div>
              }
              value={
                data?.bondData?.maturityDate
                  ? dateTimeUtils.formatDateTime(
                      data?.bondData?.maturityDate,
                      "DD MMM YYYY"
                    )
                  : "NA"
              }
            />
            <InfoLabel
              title={
                <div className="flex items-center gap-2">
                  Rating
                  <FaStar
                    size={14}
                    style={{
                      color: getRatingColor(
                        data?.bondData?.creditRating || "NA"
                      ),
                    }}
                  />
                </div>
              }
              value={data?.bondData?.creditRating || "NA"}
            />
          </div>
          <div
            className={cn(
              "flex lg:justify-end lg:mt-0 mt-5 items-center lg:w-auto w-full",
              gridMode && "lg:mt-5 lg:flex lg:justify-start lg:w-full w-full"
            )}
          >
            <Link
              href={"/issuer-notes/" + data?.Slug}
              className={cn(
                " bg-muted hover:bg-primary  text-nowrap text-primary hover:text-white font-medium lg:w-auto w-full flex justify-center items-center gap-5 rounded-md px-3 py-2",
                gridMode && "lg:w-full w-full"
              )}
            >
              View Notes <IoMdArrowDropright className="text-secondary" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
