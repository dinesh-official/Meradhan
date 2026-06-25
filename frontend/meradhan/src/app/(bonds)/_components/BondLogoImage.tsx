"use client";

import { genBondLogoUrl } from "@/global/utils/url.utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export function getBondLogoSrc(logoUrl?: string | null): string | null {
  return genBondLogoUrl(logoUrl);
}

export default function BondLogoImage({
  logoUrl,
  alt,
  className,
  imgClassName,
}: {
  logoUrl?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const src = getBondLogoSrc(logoUrl);
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  return (
    <div
      className={cn(
        "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white sm:h-24 sm:w-24",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={96}
        height={96}
        className={cn("h-full w-full object-contain", imgClassName)}
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}
