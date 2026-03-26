"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CMS_URL } from "@/global/constants/domains";
import { SharePopupTrigger } from "@/global/module/share/SharePopupView";
import { formatDateCustom } from "@/global/utils/datetime.utils";
import { getFileIcon } from "@/global/utils/icon";
import { FaInfoCircle, FaShareAlt } from "react-icons/fa";
import { T_RegulatoryCirculars_GQL_RESPONSE } from "../_actions/reg-cir";

function ListViewCard({
  item,
  index,
}: {
  item: T_RegulatoryCirculars_GQL_RESPONSE[number];
  index: number;
}) {
  return (
    <li
      key={index}
      className="flex justify-between items-center py-4 px-3 border-b border-[#e0e0e0]"
    >
      {/* Left Section */}
      <div className="flex items-center flex-wrap md:flex-nowrap gap-5">
        {/* Logo */}
        <img
          src={CMS_URL + item.regulatory_circulars_category.Logo.url}
          alt={item?.File.url}
          className="w-[35px] h-auto"
        />

        {/* Date */}
        <div className="font-medium">
          {formatDateCustom(item.Circular_Date)}
        </div>

        {/* Title */}
        <div className="font-medium text-[0.95rem]">{item.Name}</div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5 mt-3 md:mt-0">
        {/* Info Tooltip (shadcn/ui) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer">
              <FaInfoCircle size={18} color="#666666" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs text-center">
            <p>
              Circular Number:
              <br />
              {item?.Circular_Number || "N/A"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* File Icon */}
        <a
          href={CMS_URL + item?.File?.url}
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          {getFileIcon(item?.File?.url.split(".").pop() || "")}
        </a>

        {/* Share Icon */}
        <SharePopupTrigger
          url="https://dev.meradhan.co/regulatory-circulars"
          title="Share Regulatory Circulars"
        >
          <FaShareAlt size={18} color="#666666" />
        </SharePopupTrigger>
      </div>
    </li>
  );
}

export default ListViewCard;
