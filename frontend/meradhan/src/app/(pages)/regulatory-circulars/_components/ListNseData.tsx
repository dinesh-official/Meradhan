import { FileText, Info, Share2 } from "lucide-react";
import Image from "next/image";
import React from "react";

interface ListNseDataItem {
  date: string;
  exchange: string;
  title: string;
}

interface ListNseDataProps {
  nseData: ListNseDataItem[];
}

const ListNseData = ({nseData}:ListNseDataProps) => {
  return (
    <div className="max-w-[70%]  m-auto mt-[4rem] mb-[4rem]">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 mt-4 gap-4">
        {nseData.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col border rounded-md p-5 gap-5 hover:shadow-md transition-shadow justify-evenly"
          >
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-gray-600">{item.date}</p>
              <Image
                src="/assets/nse_logo.svg"
                alt={`${item.exchange} logo`}
                width={50}
                height={50}
              />
            </div>

            <div>
              <p className="text-[16px] font-semibold text-gray-800 leading-snug">
                {item.title.slice(0, 80)}
                {"..."}
              </p>

              {/* Divider */}
              <div className="w-full h-[1px] bg-gray-300 my-3" />

              {/* Icons */}
            </div>

            <div className="flex items-center justify-center gap-6 text-gray-500">
              <Info
                size={20}
                className="cursor-pointer hover:text-blue-600 transition-colors"
              />
              <div className="w-[1px] h-4 bg-gray-300" />
              <FileText
                size={20}
                className="cursor-pointer hover:text-red-500 transition-colors"
              />
              <div className="w-[1px] h-4 bg-gray-300" />
              <Share2
                size={20}
                className="cursor-pointer hover:text-green-600 transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListNseData;
