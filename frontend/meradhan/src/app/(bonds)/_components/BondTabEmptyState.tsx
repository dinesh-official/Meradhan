"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { LucideIcon } from "lucide-react";
import { FileText } from "lucide-react";

export function BondTabEmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  const Icon = icon ?? FileText;
  return (
    <div className="py-6">
      <Empty className="rounded-xl border border-slate-200 bg-slate-50/60 py-12 shadow-none md:py-14">
        <EmptyMedia
          variant="icon"
          className="size-12 rounded-full bg-slate-100 text-slate-500 [&_svg]:size-6"
        >
          <Icon aria-hidden />
        </EmptyMedia>

        <EmptyHeader>
          <EmptyTitle className="text-slate-900">{title}</EmptyTitle>
          {description ? (
            <EmptyDescription className="max-w-md text-slate-600">
              {description}
            </EmptyDescription>
          ) : null}
        </EmptyHeader>
      </Empty>
    </div>
  );
}
