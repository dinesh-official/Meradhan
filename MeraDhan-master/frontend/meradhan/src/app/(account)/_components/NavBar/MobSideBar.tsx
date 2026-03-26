"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMounted } from "@/hooks/useMounted";
import { Menu } from "lucide-react";
import Image from "next/image";
import { accountMenuItems } from "./ActionSideBar";
import { cn } from "@/lib/utils"; // optional helper for class merging
import Link from "next/link";
import { memo } from "react";

function MobSideBar() {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div
        className="lg:hidden hover:bg-gray-100 p-2 rounded-md transition cursor-pointer inline-flex items-center justify-center"
        aria-hidden
      >
        <Menu className="" />
      </div>
    );
  }

  return (
    <Sheet>
      {/* Trigger Button (Visible only on Mobile) */}
      <SheetTrigger className="lg:hidden hover:bg-gray-100 p-2 rounded-md transition cursor-pointer">
        <Menu className="" />
      </SheetTrigger>

      {/* Sidebar Content */}
      <SheetContent
        side="left"
        className={cn(
          "flex flex-col bg-white shadow-lg p-0 border-none text-gray-900"
        )}
      >
        {/* Header / Logo */}
        <SheetHeader className="flex items-start px-6 py-4 border-gray-200 border-b">
          <Image
            src={`/logo/mera-dhan-logo.svg`}
            width={160}
            height={50}
            alt="Mera Dhan"
            className="w-auto h-8"
            priority
          />
        </SheetHeader>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col">
            {accountMenuItems.map((item, i) => (
              <Link
                href={item.href || "#"}
                key={i}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 cursor-pointer select-none",
                  "transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 rounded-md"
                )}
              >
                <span className="flex justify-center items-center w-6">
                  {item.icon}
                </span>
                <span className="font-medium text-gray-800 text-sm">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-gray-200 border-t text-gray-500 text-xs">
          © {new Date().getFullYear()} MeraDhan LLP. All Rights Reserved  <small className="text-gray-400">V 1.0.0</small>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default memo(MobSideBar);
