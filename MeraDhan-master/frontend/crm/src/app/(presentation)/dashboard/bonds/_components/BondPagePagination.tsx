"use client";

import CardPagination from "@/global/elements/table/CardPagination";
import { useGeneratePageUrl } from "../_hooks/useGeneratePageUrl";

function BondPagePagination({
  activePage,
  totalPages,
  pathname,
}: {
  activePage?: number;
  totalPages?: number;
  pathname: string;
}) {
  const generatePageUrl = useGeneratePageUrl();

  if (totalPages && totalPages < 1) {
    return null;
  }

  return (
    <CardPagination
      page={activePage || 1}
      totalPages={totalPages || 1}
      onClick={(pageIndex) =>
        (window.location.href = generatePageUrl({
          basePath: pathname + "/page/" + pageIndex,
        }))
      }
    />
  );
}

export default BondPagePagination;
