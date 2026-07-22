"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type Props = {
  value: string;
  /** e.g. "Payment" — shown before the status label */
  prefix?: string;
};

function normalizeStatus(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .trim();
}

function getStatusClass(value: string) {
  const normalized = normalizeStatus(value);

  switch (normalized) {
    // Success / completed
    case "verified":
    case "yes":
    case "enabled":
    case "active":
    case "accepted":
    case "buy":
    case "settled":
    case "completed":
    case "captured":
    case "success":
    case "available":
    case "kyc validated":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";

    // In progress / informational
    case "applied":
    case "register":
    case "download kra":
    case "kyc registered":
    case "in progress":
    case "authorized":
    case "processing":
      return "border border-blue-200 bg-blue-50 text-blue-700";

    // Pending / waiting
    case "pending":
    case "waiting":
    case "created":
    case "under process":
    case "underprocess":
    case "under review":
    case "on hold":
    case "onhold":
    case "cbrics pending":
    case "re kyc":
      return "border border-amber-200 bg-amber-50 text-amber-700";

    // Neutral / terminal inactive
    case "suspended":
    case "closed":
    case "not started":
    case "not available":
    case "not completed":
    case "cancelled":
    case "canceled":
    case "expired":
      return "border border-slate-200 bg-slate-100 text-slate-700";

    // Refunded
    case "refunded":
    case "used existing kra":
      return "border border-violet-200 bg-violet-50 text-violet-700";

    // Failed / rejected
    case "rejected":
    case "kyc rejected":
    case "error":
    case "not found":
    case "disabled":
    case "failed":
    case "failure":
      return "border border-rose-200 bg-rose-50 text-rose-700";

    default:
      return "border border-slate-200 bg-slate-50 text-slate-600";
  }
}

function formatStatusLabel(value: string) {
  const normalized = value.trim().toUpperCase();
  const knownLabels: Record<string, string> = {
    PENDING: "Pending",
    COMPLETED: "Completed",
    REFUNDED: "Refunded",
    CANCELLED: "Cancelled",
    CANCELED: "Cancelled",
    SUCCESS: "Success",
    FAILED: "Failed",
    FAILURE: "Failed",
    CAPTURED: "Captured",
    AUTHORIZED: "Authorized",
    CREATED: "Created",
    PROCESSING: "Processing",
    IN_PROGRESS: "In progress",
    SETTLED: "Settled",
    APPLIED: "Applied",
    REJECTED: "Rejected",
    EXPIRED: "Expired",
  };
  if (knownLabels[normalized]) return knownLabels[normalized];
  return value.replaceAll("_", " ");
}

export default function StatusBadge({ value, prefix }: Props) {
  const cls = useMemo(() => getStatusClass(value), [value]);
  const label = useMemo(() => formatStatusLabel(value), [value]);

  return (
    <Badge
      variant="outline"
      className={cn("rounded px-2 text-xs font-medium shadow-none", cls)}
    >
      {prefix ? (
        <>
          <span className="font-normal opacity-70">{prefix}</span>
          <span className="mx-1 opacity-40">·</span>
        </>
      ) : null}
      {label}
    </Badge>
  );
}
