"use client";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AiOutlineMenu } from "react-icons/ai";
import Image from "next/image";
import { MENU_ITEMS } from "../../constants/menu.constants";
import { IoMdArrowDropdown } from "react-icons/io";

interface MenuItemProps {
  item: (typeof MENU_ITEMS)[number];
  level?: number;
}

function MobMenu() {
  return (
    <Sheet  >
      <SheetTrigger className="lg:hidden block" >
        <div className="cursor-pointer">
          <AiOutlineMenu size={30} />
        </div>
      </SheetTrigger>
      <SheetContent className="w-full max-w-xs p-0 flex flex-col h-full gap-0 border-l-0">
        {/* Header */}
        <SheetHeader className="px-4 py-4  border-none flex-shrink-0">
          <SheetTitle>
            <Image
              src={`/logo/mera-dhan-logo.svg`}
              width={400}
              height={200}
              alt="meradhan"
              className="w-auto h-8"
            />
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto">
          {MENU_ITEMS.map((item, i) => (
            <MobileMenuItem key={i} item={item} />
          ))}
        </div>

        {/* Bottom Login / Signup Buttons */}
        <div className="flex flex-col gap-3 p-4 border-t flex-shrink-0 border-t-gray-200">
          <button className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition">
            Login
          </button>
          <button className="w-full py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition">
            Sign Up
          </button>
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
    <div className="flex flex-col w-full border-t border-t-gray-200">
      {/* Menu Item Header */}
      <div
        className={`flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:text-primary transition-all cursor-pointer ${
          level > 0 ? `pl-${level * 4}` : ""
        }`}
        onClick={() => hasChildren && setOpen(!open)}
      >
        <span>{item.title}</span>
        {hasChildren && (
          <IoMdArrowDropdown
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : "-rotate-90"
            }`}
          />
        )}
      </div>

      {/* Nested Children */}
      {hasChildren && open && (
        <div className="flex flex-col w-full ">
          {item.children!.map((child, idx) => (
            <MobileMenuItem key={idx} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
