"use client";

import type { Order } from "@root/apiGateway";
import { getSecurityNameColumnLines } from "../_utils";

export function SecurityNameCell({ order }: { order: Order }) {
  const { isin, titleLine, maturityLine } = getSecurityNameColumnLines(order);

  return (
    <div className="min-w-0 max-w-full overflow-hidden leading-snug">
      <p
        className="truncate text-sm font-normal text-gray-500"
        title={isin !== "—" ? isin : undefined}
      >
        {isin}
      </p>
      <p
        className="mt-1 line-clamp-2 min-w-0 wrap-break-word text-sm font-semibold text-gray-900 md:text-base"
        title={titleLine !== "—" ? titleLine : undefined}
      >
        {titleLine}
      </p>
      <p
        className="mt-0.5 truncate text-sm font-normal text-gray-500"
        title={maturityLine !== "—" ? `Maturity Date: ${maturityLine}` : undefined}
      >
        {maturityLine !== "—" && (
          <span className="font-medium text-gray-400">Maturity Date: </span>
        )}
        {maturityLine}
      </p>
    </div>
  );
}
