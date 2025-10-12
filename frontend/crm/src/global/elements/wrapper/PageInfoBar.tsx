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
    <div className="flex justify-between items-start">
      <div className="flex flex-row items-center gap-5">
        {showBack && (
          <Button
            onClick={() => router.back()}
            className="p-0 overflow-hidden w-10 h-10 rounded-full"
            variant={"outline"}
          >
            <ChevronLeft />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}

export default PageInfoBar;
