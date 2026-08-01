"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashBoardDataViewCardProps {
  /** Title of the card (can be text or ReactNode) */
  title?: ReactNode;
  /** Accessible id for the title (must be unique when multiple cards on a page). */
  titleId?: string;
  /** Optional top-right link (e.g. “View all orders”) — use strings so Server Components can pass it. */
  headerAction?: { href: string; label: string };
  /** Whether the card has no data to display */
  isEmpty?: boolean;
  /** Optional custom message for empty state */
  emptyMessage?: string;
  /** Optional CTA button text for empty state */
  ctaText?: string;
  /** Optional link for CTA (preferred over onClick from server components). */
  ctaHref?: string;
  /** Function triggered when CTA button is clicked */
  onCtaClick?: () => void;
  /** Optional illustration for empty state */
  emptyImageSrc?: string;
  /** Card content when not empty */
  children?: ReactNode;
}

export default function DashBoardDataViewCard({
  title = (
    <>
      My <span className="text-secondary">Portfolio</span>
    </>
  ),
  titleId = "dashboard-data-view-card-title",
  headerAction,
  isEmpty = true,
  emptyMessage = "No investment found",
  ctaText,
  ctaHref,
  onCtaClick,
  emptyImageSrc = "/static/sad-emoji.svg",
  children,
}: DashBoardDataViewCardProps) {
  return (
    <Card
      className="border-gray-200 rounded-lg min-h-96"
      role="region"
      aria-labelledby={titleId}
    >
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-x-4 gap-y-2 space-y-0 pb-4">
        <CardTitle id={titleId} className="min-w-0 flex-1 font-medium text-2xl">
          {title}
        </CardTitle>
        {headerAction ? (
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href={headerAction.href} title={headerAction.label} aria-label={headerAction.label}>{headerAction.label}</Link>
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="h-full">
        {isEmpty ? (
          <div
            className="flex flex-col justify-center lg:justify-start items-center gap-5 py-10 h-full text-center"
            role="status"
            aria-live="polite"
          >
            <Image
              src={emptyImageSrc}
              alt="Empty state illustration"
              title="Empty state illustration"
              aria-label="Empty state illustration"
              width={150}
              height={150}
              className="w-20 h-20 object-contain"
              priority
            />
            <p className="text-gray-600 text-base">{emptyMessage}</p>
            {ctaText && ctaHref ? (
              <Button variant="outline" asChild aria-label={ctaText}>
                <Link href={ctaHref} title={ctaText} aria-label={ctaText}>{ctaText}</Link>
              </Button>
            ) : (
              ctaText && (
                <Button
                  variant="outline"
                  onClick={onCtaClick}
                  aria-label={ctaText}
                >
                  {ctaText}
                </Button>
              )
            )}
          </div>
        ) : (
          <div className="h-full">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
