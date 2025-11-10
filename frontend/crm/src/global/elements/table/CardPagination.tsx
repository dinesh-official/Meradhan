"use client";
import React, { memo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CardFooter } from "@/components/ui/card";

interface CardPaginationProps {
  page: number;
  totalPages: number;
  onClick: (page: number) => void;
}

function CardPagination({ page, totalPages, onClick }: CardPaginationProps) {
  if (page == 1 && totalPages == 1) {
    return null;
  }
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 2; // number of pages to show around the current page
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1); // always show first page

    if (left > 2) {
      pages.push("ellipsis");
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push("ellipsis");
    }

    if (totalPages > 1) {
      pages.push(totalPages); // always show last page
    }

    return pages;
  };

  const handleClick = (p: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (p !== page) onClick(p);
  };

  return (
    <CardFooter>
      <Pagination>
        <PaginationContent>
          {page != 1 && (
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => handleClick(Math.max(1, page - 1), e)}
              />
            </PaginationItem>
          )}

          {getPageNumbers().map((p, index) => (
            <PaginationItem key={index}>
              {p === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={(e) => handleClick(p, e)}
                  className={page == p ? "bg-secondary" : ""}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {page != totalPages && (
            <PaginationItem>
              <PaginationNext
                onClick={(e) => handleClick(Math.min(totalPages, page + 1), e)}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </CardFooter>
  );
}

export default memo(CardPagination);
