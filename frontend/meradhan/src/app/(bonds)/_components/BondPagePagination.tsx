"use client";
import CardPagination from "@/global/elements/CardPagination";
import { useGeneratePageUrl } from "@/hooks/useGeneratePageUrl";

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
  if (totalPages == 1) {
    return null;
  }

  return (
    <CardPagination
      page={activePage || 1}
      totalPages={totalPages || 1}
      getPageLink={(pageIndex) =>
        generatePageUrl({
          basePath: pathname + "/page/" + pageIndex,
        })
      }
    />
  );
}

export default BondPagePagination;
