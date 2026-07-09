"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import React, { ReactNode } from "react";

function PageInfoBar({
  description,
  actions,
  title,
  showBack,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  showBack?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex md:flex-row flex-col justify-between items-start gap-5">
      <div className="flex flex-row items-center gap-5">
        {showBack && (
          <Button
            onClick={() => router.back()}
            className="p-0 border-gray-200 rounded-full w-8 h-8 overflow-hidden"
            variant={"outline"}
          >
            <ChevronLeft />
          </Button>
        )}
        <div>
          <h1 className="font-bold">{title}</h1>
          <p className="text-gray-500 text-xs">{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}

export default PageInfoBar;
