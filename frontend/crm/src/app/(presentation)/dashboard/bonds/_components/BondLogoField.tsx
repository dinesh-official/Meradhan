"use client";

import { useCorporateKycFileUpload } from "@/app/(presentation)/dashboard/customers/[id]/corporate-kyc/_hooks/useCorporateKycFileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { genMediaUrl } from "@/global/utils/url.utils";
import { cn } from "@/lib/utils";
import apiGateway from "@root/apiGateway";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);

type BondLogoFieldProps = {
  isin: string;
  initialLogoUrl?: string | null;
  className?: string;
};

export function BondLogoField({
  isin,
  initialLogoUrl,
  className,
}: BondLogoFieldProps) {
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useCorporateKycFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const normalizedIsin = isin.trim().toUpperCase();

  const logoQueryKey = ["bond-logo", normalizedIsin] as const;

  const { data: logoUrl } = useQuery({
    queryKey: logoQueryKey,
    queryFn: async () => {
      const res = await bondsApi.getBondLogo(normalizedIsin);
      return res.responseData?.logoUrl ?? null;
    },
    enabled: Boolean(normalizedIsin),
    initialData: initialLogoUrl ?? null,
    refetchOnWindowFocus: false,
  });

  const [pendingLogoUrl, setPendingLogoUrl] = useState("");

  useEffect(() => {
    setPendingLogoUrl(logoUrl ?? "");
  }, [logoUrl]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = pendingLogoUrl.trim();
      if (!url) throw new Error("Upload a logo image first");
      return bondsApi.updateBondLogo(normalizedIsin, url);
    },
    onSuccess: () => {
      toast.success("Bond logo saved");
      void queryClient.invalidateQueries({ queryKey: logoQueryKey });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err instanceof Error ? err.message : "Failed to save bond logo");
      toast.error(message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => bondsApi.deleteBondLogo(normalizedIsin),
    onSuccess: () => {
      toast.success("Bond logo removed");
      setPendingLogoUrl("");
      void queryClient.invalidateQueries({ queryKey: logoQueryKey });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err instanceof Error ? err.message : "Failed to remove bond logo");
      toast.error(message);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "bond-logos");
    if (url) setPendingLogoUrl(url);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const previewUrl = pendingLogoUrl.trim()
    ? genMediaUrl(pendingLogoUrl.trim())
    : null;
  const hasChanges = pendingLogoUrl.trim() !== (logoUrl ?? "").trim();
  const busy =
    uploading || saveMutation.isPending || removeMutation.isPending;

  if (!normalizedIsin) return null;

  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/20 p-3 md:col-span-2",
        className,
      )}
    >
      <Label className="text-sm font-medium">Bond logo</Label>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Shown on bond listings and detail pages. PNG, JPG, WEBP, or SVG.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Bond logo preview"
              width={48}
              height={48}
              className="h-full w-full object-contain"
              unoptimized
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          className="hidden"
          disabled={busy}
          onChange={handleFileSelect}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-3.5 w-3.5" />
          )}
          {uploading ? "Uploading…" : "Upload"}
        </Button>

        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {logoUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => removeMutation.mutate()}
            >
              {removeMutation.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Remove
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={!pendingLogoUrl.trim() || !hasChanges || busy}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
