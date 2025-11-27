"use client";
import CardPagination from "@/global/elements/CardPagination";
import React from "react";

function Pagination({
  pageInfo,
}: {
  pageInfo?: {
    pageCount?: number;
    page?: number;
  };
}) {
  if ((pageInfo?.pageCount || 0) < 2) {
    return null;
  }
  return (
    <div className="mt-12">
      <CardPagination
        totalPages={pageInfo?.pageCount || 1}
        page={pageInfo?.page || 1}
        getPageLink={(e) => `/issuer-notes?page=${e}`}
      />
    </div>
  );
}

export default Pagination;
