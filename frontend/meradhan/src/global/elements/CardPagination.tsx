"use client";
import React, { memo } from "react";
import clsx from "clsx";
import Link from "next/link";

interface CardPaginationProps {
  page: number;
  totalPages: number;
  onClick?: (page: number) => void; // optional
  getPageLink?: (page: number) => string; // optional link generator
  disabled?: boolean;
}

function CardPagination({
  page,
  totalPages,
  onClick,
  getPageLink,
  disabled,
}: CardPaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);

    if (left > 2) pages.push("ellipsis");

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) pages.push("ellipsis");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const handleClick = (p: number, e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      if (p !== page) onClick(p);
    }
  };

  const renderPage = (p: number | "ellipsis", index: number) => {
    if (p === "ellipsis") {
      return (
        <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
          …
        </span>
      );
    }

    const href = getPageLink ? getPageLink(p) : "#";
    const isActive = p === page;

    return (
      <Link
        key={p}
        href={href}
        onClick={(e) => handleClick(p, e)}
        className={clsx(
          "px-2 py-2 min-w-8 font-medium text-sm text-center transition-colors",
          isActive
            ? "bg-blue-900 text-white"
            : "bg-gray-100 hover:bg-blue-100 text-blue-900"
        )}
      >
        {p}
      </Link>
    );
  };

  const pages = getPageNumbers();

  return (
    <div className="w-full rounded-md bg-white overflow-hidden">
      <div className="flex justify-center items-center">
        {/* First */}
        <button
          disabled={page === 1 || disabled}
          onClick={() => onClick && onClick(1)}
          className={clsx(
            "px-2 py-2 min-w-8 font-medium text-sm text-center transition-colors ",
            page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-blue-100 text-blue-900"
          )}
        >
          «
        </button>

        {/* Prev */}
        <button
          disabled={page === 1 || disabled}
          onClick={() => onClick && onClick(page - 1)}
          className={clsx(
            "px-2 py-2 min-w-8 font-medium text-sm text-center transition-colors",
            page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-blue-100 text-blue-900"
          )}
        >
          ‹
        </button>

        {/* Page Numbers */}
        {pages.map((p, i) => renderPage(p, i))}

        {/* Next */}
        <button
          disabled={page === totalPages || disabled}
          onClick={() => onClick && onClick(page + 1)}
          className={clsx(
            "px-2 py-2 min-w-8 font-medium text-sm text-center transition-colors",
            page === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-blue-100 text-blue-900"
          )}
        >
          ›
        </button>

        {/* Last */}
        <button
          disabled={page === totalPages || disabled}
          onClick={() => onClick && onClick(totalPages)}
          className={clsx(
            "px-2 py-2 min-w-8 font-medium text-sm text-center transition-colors",
            page === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-blue-100 text-blue-900"
          )}
        >
          »
        </button>
      </div>
    </div>
  );
}

export default memo(CardPagination);
