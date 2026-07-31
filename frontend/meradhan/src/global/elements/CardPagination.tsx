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

  const renderNavButton = (
    targetPage: number,
    label: string,
    isDisabled: boolean,
    enabledClass: string,
    descriptiveLabel: string
  ) => {
    const base = "px-2 py-2 min-w-8 font-medium text-sm text-center transition-colors";
    if (isDisabled || disabled) {
      return (
        <button disabled className={clsx(base, "bg-gray-100 text-gray-400 cursor-not-allowed")}>
          {label}
        </button>
      );
    }
    if (getPageLink) {
      return (
        <Link
          href={getPageLink(targetPage)}
          title={descriptiveLabel}
          aria-label={descriptiveLabel}
          className={clsx(base, enabledClass)}
        >
          {label}
        </Link>
      );
    }
    return (
      <button onClick={() => onClick && onClick(targetPage)} className={clsx(base, enabledClass)}>
        {label}
      </button>
    );
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
        title={`Go to page ${p}`}
        aria-label={`Go to page ${p}`}
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
        {renderNavButton(1, "«", page === 1, "bg-white hover:bg-blue-100 text-blue-900", "Go to first page")}
        {renderNavButton(page - 1, "‹", page === 1, "bg-gray-100 hover:bg-blue-100 text-blue-900", "Go to previous page")}

        {/* Page Numbers */}
        {pages.map((p, i) => renderPage(p, i))}

        {renderNavButton(page + 1, "›", page === totalPages, "bg-gray-100 hover:bg-blue-100 text-blue-900", "Go to next page")}
        {renderNavButton(totalPages, "»", page === totalPages, "bg-gray-100 hover:bg-blue-100 text-blue-900", "Go to last page")}
      </div>
    </div>
  );
}

export default memo(CardPagination);
