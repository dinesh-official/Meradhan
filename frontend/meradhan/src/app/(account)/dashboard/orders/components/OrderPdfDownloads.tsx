"use client";

import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useToast } from "@/hooks/use-toast";
import apiGateway from "@root/apiGateway";
import { ChevronDown, FileDown } from "lucide-react";
import { FaEye } from "react-icons/fa6";

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

type OrderPdfDownloadsProps = {
  orderNumber: string;
  /** Table: icon-only centered trigger. Card: labeled control in expanded details. */
  variant: "table" | "card";
};

export function OrderPdfDownloads({
  orderNumber,
  variant,
}: OrderPdfDownloadsProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<null | "receipt" | "deal">(null);

  const orderApi = useMemo(
    () => new apiGateway.meradhan.customerOrderApi(apiClientCaller),
    [],
  );

  const downloadReceipt = async () => {
    setBusy("receipt");
    try {
      const blob = await orderApi.getOrderReceiptPdf(orderNumber);
      triggerBlobDownload(blob, `order-receipt-${orderNumber}.pdf`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Order receipt",
        description: errorMessage(err),
      });
    } finally {
      setBusy(null);
    }
  };

  const downloadDeal = async () => {
    setBusy("deal");
    try {
      const blob = await orderApi.getDealSheetPdf(orderNumber);
      triggerBlobDownload(blob, `deal-sheet-${orderNumber}.pdf`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Deal sheet",
        description: errorMessage(err),
      });
    } finally {
      setBusy(null);
    }
  };

  const triggerClassName =
    variant === "table"
      ? "flex h-9 w-9 items-center justify-center rounded-md text-primary hover:bg-primary/5"
      : "inline-flex h-9 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 hover:bg-gray-50";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={triggerClassName}
          aria-label="Download order documents"
          disabled={!!busy}
        >
          {variant === "table" ? (
            <FaEye size={18} />
          ) : (
            <>
              <FileDown className="size-4 text-primary" aria-hidden />
              PDFs
              <ChevronDown className="size-4 opacity-60" aria-hidden />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "table" ? "end" : "start"}>
        <DropdownMenuItem
          disabled={busy !== null}
          onSelect={(e) => {
            e.preventDefault();
            void downloadReceipt();
          }}
        >
          {busy === "receipt" ? "Preparing…" : "Order receipt"}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={busy !== null}
          onSelect={(e) => {
            e.preventDefault();
            void downloadDeal();
          }}
        >
          {busy === "deal" ? "Preparing…" : "Deal sheet"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
