import Image from "next/image";
import React from "react";

function PreviewCard({
  source,
  type,
  url,
}: {
  url: string;
  type: string;
  source: string;
}) {
  return (
    <div className="bg-gray-50 p-3 border-2 border-dashed rounded-xl">
      <Image
        src={url}
        alt=""
        width={500}
        height={500}
        className="rounded-xl object-contain aspect-square"
      />
      <div className="mt-3 text-center">
        <p className="text-gray-500 text-sm">{type}</p>
        <p className="font-medium text-xs uppercase">{source}</p>
      </div>
    </div>
  );
}

export default PreviewCard;
