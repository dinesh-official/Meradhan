"use client";
import CardPagination from "@/global/elements/CardPagination";
import React from "react";

function Pagination({
  pageInfo,
  categoryName,
}: {
  pageInfo?: {
    pageCount?: number;
    page?: number;
  };
  categoryName?: string;
}) {
  if ((pageInfo?.pageCount || 0) < 2) {
    return null;
  }
  return (
    <div className="mt-12">
      <CardPagination
        totalPages={pageInfo?.pageCount || 1}
        page={pageInfo?.page || 1}
        getPageLink={(e) => {
          const url = categoryName
            ? `/news/category/${categoryName}?page=${e}`
            : `/news?page=${e}`;
          return url;
        }}
      />
    </div>
  );
}

export default Pagination;
