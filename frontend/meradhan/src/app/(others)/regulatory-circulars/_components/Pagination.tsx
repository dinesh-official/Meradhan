"use client";
import CardPagination from "@/global/elements/CardPagination";
import React from "react";

function Pagination({
  pageInfo,
  categorySlug,
}: {
  pageInfo?: {
    pageCount?: number;
    page?: number;
  };
  categorySlug?: string;
}) {
  if ((pageInfo?.pageCount || 0) < 2) {
    return null;
  }
  return (
    <div className="mt-12">
      <CardPagination
        totalPages={pageInfo?.pageCount || 1}
        page={pageInfo?.page || 1}
        getPageLink={(e) =>
          categorySlug
            ? `/regulatory-circulars/${categorySlug}?page=${e}`
            : `/regulatory-circulars?page=${e}`
        }
      />
    </div>
  );
}

export default Pagination;
