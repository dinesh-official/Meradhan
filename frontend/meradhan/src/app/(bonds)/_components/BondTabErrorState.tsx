"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { toUserFacingErrorMessage } from "@/global/utils/userFacingError.utils";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

function resolveTabErrorDetail(error: unknown): string | undefined {
  return toUserFacingErrorMessage(error);
}

export function BondTabErrorState({
  title,
  description = "Something went wrong while loading this section.",
  error,
  onRetry,
  isRetrying = false,
}: {
  title: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  const detail = error ? resolveTabErrorDetail(error) : undefined;

  return (
    <div className="py-6" role="alert">
      <Empty className="rounded-xl border border-slate-200 bg-slate-50/60 py-12 md:py-14">
        <EmptyMedia
          variant="icon"
          className="size-12 rounded-full bg-amber-100 text-amber-700 [&_svg]:size-6"
        >
          <AlertCircle aria-hidden />
        </EmptyMedia>

        <EmptyHeader>
          <EmptyTitle className="text-slate-900">{title}</EmptyTitle>
          <EmptyDescription className="text-slate-600">
            {description}
            {detail ? (
              <span className="mt-2 block text-slate-500">{detail}</span>
            ) : null}
          </EmptyDescription>
        </EmptyHeader>

        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            className="border-slate-300 bg-white hover:bg-slate-50"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Retrying…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                Try again
              </>
            )}
          </Button>
        ) : null}
      </Empty>
    </div>
  );
}
