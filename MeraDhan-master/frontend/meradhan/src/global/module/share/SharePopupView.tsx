"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { FaFacebook, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { useSharePopupStore } from "./useShareStore";

interface SharePopupTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  url: string;
  children?: React.ReactNode;
}

export function SharePopupTrigger({
  children,
  title,
  url,
  ...rest
}: SharePopupTriggerProps) {
  const { open } = useSharePopupStore();

  return (
    <div
      {...rest}
      className="cursor-pointer "
      onClick={(e) => {
        rest.onClick?.(e);
        open({ title, url });
      }}
    >
      {children}
    </div>
  );
}

export function SharePopupViewProvider() {
  const { isOpen, data, close } = useSharePopupStore();

  if (!isOpen) return null;

  const shareUrl = encodeURIComponent(data?.url || "");
  const shareTitle = encodeURIComponent(data?.title || "");

  const handleShare = (platform: string) => {
    let url = "";

    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`;
        break;
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`;
        break;
      default:
        return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center quicksand-semibold">
            {data?.title || "Share this page"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-5 text-center">
          <p className="text-sm">Share this link via</p>
          <div className="flex justify-center items-center gap-4 text-2xl">
            <button
              aria-label="Share on Facebook"
              onClick={() => handleShare("facebook")}
              className="flex justify-center items-center bg-blue-600 rounded-full w-10 h-10 text-white transition-colors cursor-pointer"
            >
              <FaFacebook />
            </button>
            <button
              aria-label="Share on LinkedIn"
              onClick={() => handleShare("linkedin")}
              className="flex justify-center items-center bg-blue-700 rounded-full w-10 h-10 text-white transition-colors cursor-pointer"
            >
              <FaLinkedin />
            </button>
            <button
              aria-label="Share on WhatsApp"
              onClick={() => handleShare("whatsapp")}
              className="flex justify-center items-center bg-green-600 rounded-full w-10 h-10 text-white transition-colors cursor-pointer"
            >
              <FaWhatsapp />
            </button>
            <button
              aria-label="Share on Twitter/X"
              onClick={() => handleShare("twitter")}
              className="flex justify-center items-center bg-black rounded-full w-10 h-10 text-white transition-colors cursor-pointer"
            >
              <RiTwitterXFill />
            </button>
          </div>
        </div>

        <DialogFooter className="mt-8 w-full">
          <div className="relative w-full">
            <Input
              className="peer overflow-hidden"
              disabled
              value={data.url}
              readOnly
              adminMode
            />
            <div
              onClick={() => {
                navigator.clipboard.writeText(data?.url || "");
                toast.success("Link copied to clipboard!", {
                  position: "top-center",
                });
              }}
              className="absolute inset-y-0 flex justify-center items-center bg-[#f2f2f2] pe-3 pl-3 rounded-2xl text-primary cursor-pointer end-0"
            >
              <Copy size={16} aria-hidden="true" />
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
