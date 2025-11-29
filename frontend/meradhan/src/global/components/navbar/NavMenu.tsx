import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MENU_ITEMS } from "@/global/constants/menu.constants";

function NavMenu() {
  return (
    <nav className="flex items-center gap-7">
      {MENU_ITEMS.map((item, i) => (
        <div key={i} className="group relative cursor-pointer">
          {/* Top-Level Menu */}
          <div className="flex items-center gap-2 hover:text-primary transition-all">
            <span>{item.title}</span>
            {item.children && (
              <IoMdArrowDropdown className="group-hover:rotate-180 transition-all duration-200" />
            )}
          </div>
          {/* Level 1 Dropdown */}
          {item.children && <NavMenuList item={item} />}
        </div>
      ))}
    </nav>
  );
}

export default NavMenu;

function NavMenuList({
  item,
  isNested,
}: {
  item: (typeof MENU_ITEMS)[number];
  isNested?: boolean;
}) {
  return (
    <>
      {item.children && (
        <div
          className={cn(
            // Base styles
            "absolute bg-white border border-gray-100   rounded-md w-52 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform group-hover:translate-y-1",
            // Position: open below if root, open right if nested
            isNested
              ? "left-full top-0 -ml-1 right-0 -mt-1 "
              : "top-full -left-14 mt-3 "
          )}
        >
          <ul className="">
            {item.children.map((subItem, j) => (
              <li
                key={j}
                className={cn(
                  "group/item relative flex justify-between items-center hover:bg-primary/10 hover:text-primary text-sm whitespace-nowrap transition",
                  subItem.children && "pr-6"
                )}
              >
                {/* Menu Item + Right Arrow */}

                <Link
                  href={subItem.href || "#"}
                  className="block px-4 py-2 w-full"
                >
                  {subItem.title}
                </Link>
                {subItem.children && (
                  <IoMdArrowDropdown className="text-gray-400 group-hover/item:text-primary rotate-[-90deg] transition-all duration-200" />
                )}

                {/* Nested Dropdown — Opens to the Right */}
                {subItem.children && (
                  <div
                    className={cn(
                      "invisible group-hover/item:visible top-0 left-full absolute opacity-0 group-hover/item:opacity-100 ml-1 transition-all group-hover/item:translate-x-1 duration-200 ease-in-out transform"
                    )}
                  >
                    <NavMenuList item={subItem} isNested={true} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
