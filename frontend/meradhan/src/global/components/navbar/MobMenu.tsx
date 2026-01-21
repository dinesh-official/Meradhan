"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ISessionResponse } from "@root/apiGateway";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { IoMdArrowDropdown } from "react-icons/io";
import { MENU_ITEMS } from "../../constants/menu.constants";

interface MenuItemProps {
  item: (typeof MENU_ITEMS)[number];
  level?: number;
}

function MobMenu({ session }: { session?: ISessionResponse["responseData"] | null }) {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden block">
        <div className="cursor-pointer">
          <AiOutlineMenu size={30} />
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-0 p-0 border-l-0 w-full max-w-xs h-full">
        {/* Header */}
        <SheetHeader className="flex-shrink-0 px-4 py-4 border-none">
          <SheetTitle>
            <Link href={"/"}>
              <Image
                src={`/logo/mera-dhan-logo.svg`}
                width={400}
                height={200}
                alt="meradhan"
                className="w-auto h-8"
              />
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto">
          {MENU_ITEMS.map((item, i) => {
            return <MobileMenuItem item={item} key={i} />;
          })}
        </div>

        {/* Bottom Login / Signup Buttons */}
        <div className="flex flex-col flex-shrink-0 gap-3 p-4 border-t border-t-gray-200">
          <Link
            href={session?.id ? "/dashboard" : "/login"}
            className="bg-primary hover:bg-primary/90 py-2 rounded-md w-full text-white text-center transition"
          >
            {session?.id ? "Go to Dashboard" : "Login"}
          </Link>
          <Link
            href={session?.id ? "/logout" : "/signup"}
            className="hover:bg-primary/10 py-2 border border-primary rounded-md w-full text-primary text-center transition"
          >
            {session?.id ? "Logout" : "Sign Up"}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobMenu;

/* Recursive Mobile Menu Item */
const MobileMenuItem = ({ item, level = 0 }: MenuItemProps) => {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="flex flex-col border-t border-t-gray-200 w-full">
      {/* Menu Item Header */}
      <div
        className={`flex items-center justify-between w-full px-4 py-3  hover:text-primary transition-all cursor-pointer ${level > 0 ? `pl-${level * 4}` : ""
          }`}
      >
        {item.href ? (
          <Link
            href={item.href}
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            {item.title}
          </Link>
        ) : (
          <span
            className="flex-1"
            onClick={() => hasChildren && setOpen(!open)}
          >
            {item.title}
          </span>
        )}

        {hasChildren && (
          <IoMdArrowDropdown
            onClick={() => setOpen(!open)}
            className={`transition-transform duration-200 ${open ? "rotate-180" : "-rotate-90"
              }`}
          />
        )}
      </div>

      {/* Nested Children */}
      {hasChildren && open && (
        <div className="flex flex-col w-full">
          {item.children!.map((child, idx) => (
            <MobileMenuItem key={idx} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
