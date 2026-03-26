"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashBoardDataViewCardProps {
  /** Title of the card (can be text or ReactNode) */
  title?: ReactNode;
  /** Whether the card has no data to display */
  isEmpty?: boolean;
  /** Optional custom message for empty state */
  emptyMessage?: string;
  /** Optional CTA button text for empty state */
  ctaText?: string;
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
  isEmpty = true,
  emptyMessage = "No investment found",
  ctaText,
  onCtaClick,
  emptyImageSrc = "/static/sad-emoji.svg",
  children,
}: DashBoardDataViewCardProps) {
  return (
    <Card
      className="border-gray-200 rounded-lg min-h-96"
      role="region"
      aria-labelledby="dashboard-data-view-card-title"
    >
      <CardHeader>
        <CardTitle
          id="dashboard-data-view-card-title"
          className="font-medium text-2xl"
        >
          {title}
        </CardTitle>
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
              width={150}
              height={150}
              className="w-20 h-20 object-contain"
              priority
            />
            <p className="text-gray-600 text-base">{emptyMessage}</p>
            {ctaText && (
              <Button
                variant="outline"
                onClick={onCtaClick}
                aria-label={ctaText}
              >
                {ctaText}
              </Button>
            )}
          </div>
        ) : (
          <div className="h-full">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
