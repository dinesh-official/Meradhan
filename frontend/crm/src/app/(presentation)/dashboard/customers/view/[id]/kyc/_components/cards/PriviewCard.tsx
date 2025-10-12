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
    <div className="border-dashed border-2 p-3 rounded-xl bg-gray-50">
      <Image
        src={url}
        alt=""
        width={500}
        height={500}
        className="aspect-square object-cover rounded-xl"
      />
      <div className="text-center mt-3">
        <p className="text-gray-500">{type}</p>
        <p className="font-medium uppercase text-xs">{source}</p>
      </div>
    </div>
  );
}

export default PreviewCard;
