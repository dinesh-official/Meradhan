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

const ListNseData = ({ nseData }: ListNseDataProps) => {
  return (
    <div className="m-auto mt-[4rem] mb-[4rem]">
      <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3 mt-4">
        {nseData.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-evenly gap-5 hover:shadow-md p-5 border rounded-md transition-shadow"
          >
            <div className="flex flex-row justify-between items-center">
              <p className="text-gray-600 text-sm">{item.date}</p>
              <Image
                src="/static/nse_logo.svg"
                alt={`${item.exchange} logo`}
                width={50}
                height={50}
              />
            </div>

            <div>
              <p className="font-semibold text-[16px] text-gray-800 leading-snug">
                {item.title.slice(0, 80)}
                {"..."}
              </p>

              {/* Divider */}
              <div className="bg-gray-300 my-3 w-full h-[1px]" />

              {/* Icons */}
            </div>

            <div className="flex justify-center items-center gap-6 text-gray-500">
              <Info
                size={20}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              />
              <div className="bg-gray-300 w-[1px] h-4" />
              <FileText
                size={20}
                className="hover:text-red-500 transition-colors cursor-pointer"
              />
              <div className="bg-gray-300 w-[1px] h-4" />
              <Share2
                size={20}
                className="hover:text-green-600 transition-colors cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListNseData;
