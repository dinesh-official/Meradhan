"use client";

import { CMS_URL } from "@/global/constants/domains";
import { SharePopupTrigger } from "@/global/module/share/SharePopupView";
import { formatDateCustom } from "@/global/utils/datetime.utils";
import { getFileIcon } from "@/global/utils/icon";
import { FaInfoCircle, FaShareAlt } from "react-icons/fa";
import { T_RegulatoryCirculars_GQL_RESPONSE } from "../_actions/reg-cir";

function GridViewCard({
  item,
  index,
}: {
  item: T_RegulatoryCirculars_GQL_RESPONSE[number];
  index: number;
}) {
  console.log(item);

  const logoUrl = item?.regulatory_circulars_category?.Logo?.url
    ? CMS_URL + item.regulatory_circulars_category?.Logo?.url
    : undefined;

  const attachmentUrl = item?.File?.url ? CMS_URL + item.File.url : undefined;

  const fileExt = attachmentUrl?.split(".").pop() || "";

  return (
    <div key={index} className="w-full  px-2 mb-4">
      <div className="rounded-lg border border-gray-200 bg-white p-5  h-full flex flex-col justify-between">
        <div>
          {/* Date + Logo */}
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm ">{formatDateCustom(item.Circular_Date)}</p>

            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={item.regulatory_circulars_category?.Title || "logo"}
                className="h-6 object-contain"
              />
            ) : null}
          </div>

          {/* Title */}
          <p className="font-medium text-sm leading-6 text-gray-800 mb-2 py-5">
            {item?.Name}
          </p>

          {/* Optional Divider */}
          <div className="border-t border-gray-200 my-2" />
        </div>

        {/* Icons Row */}
        <div className="flex items-center justify-center gap-14  py-2 mt-2">
          {/* Info icon with CSS tooltip */}
          <div className="relative inline-flex items-center ">
            <button
              type="button"
              className="group focus:outline-none"
              aria-label={`Circular info ${item?.Name}`}
            >
              <div className="relative">
                <FaInfoCircle size={20} className="text-gray-500" />
                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 inline-block w-44 scale-95 transform rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
                  aria-hidden="true"
                >
                  <div className="font-medium text-xs text-gray-700">
                    Circular Number
                  </div>
                  <div className="mt-1 break-words text-xs text-gray-600">
                    {item?.Circular_Number || "-"}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Attachment / File Icon */}
          {attachmentUrl ? (
            <a
              href={attachmentUrl}
              target="_blank"
              download
              aria-label={`Download attachment for ${item?.Name}`}
            >
              {getFileIcon(fileExt)}
            </a>
          ) : null}

          {/* Share */}
          <SharePopupTrigger
            url={window.location.href}
            title="Share Regulatory Circulars"
          >
            <FaShareAlt size={18} className="text-gray-500" />
          </SharePopupTrigger>
        </div>
      </div>
    </div>
  );
}

export default GridViewCard;
