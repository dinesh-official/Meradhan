"use client";
import CardPagination from "@/global/elements/CardPagination";
import React from "react";

function Pagination({
  pageInfo,
  categorySlug,
  onClick,
}: {
  pageInfo?: {
    pageCount?: number;
    page?: number;
  };
  categorySlug?: string;
  onClick?: (page: number) => void;
}) {
  if ((pageInfo?.pageCount || 0) < 2) {
    return null;
  }
  return (
    <div className="mt-12">
      <CardPagination
        totalPages={pageInfo?.pageCount || 1}
        page={pageInfo?.page || 1}
        onClick={onClick}
      />
    </div>
  );
}

export default Pagination;
