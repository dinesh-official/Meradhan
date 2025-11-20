"use client";
import { NavItem } from "@/global/constants/navlinks.constants";
import { Role } from "@/global/constants/role.constants";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Router } from "next/router";
import { ReactNode, useState } from "react";

interface SideBarItemProps {
  item: NavItem;
  level?: number;
  activePath?: string;
  role: Role;
  compacted: boolean;
}

// use if link add in link else add div inside content
const LDiv = ({
  children,
  path,
  className,
}: {
  children?: ReactNode;
  path?: string | undefined;
  className?: string;
}) => {
  if (
    !path ||
    path == "#" ||
    path?.toString().replaceAll("#", "").length == 0
  ) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Link href={path?.toString() as unknown as Router} className={className}>
      {children}
    </Link>
  );
};

export const SideBarItems = ({
  item,
  level = 0,
  activePath,
  role,
  compacted,
}: SideBarItemProps) => {
  // Check if the active path exists in children recursively
  const hasActiveChild = (node: NavItem): boolean => {
    if (!node.children) return false;
    return node.children.some(
      (child) =>
        child.path === activePath || (child.children && hasActiveChild(child))
    );
  };

  const [isOpen, setIsOpen] = useState(hasActiveChild(item));
  const isActive = activePath === item.path;

  const toggleOpen = () => {
    if (item.children) setIsOpen(!isOpen);
  };

  // render separate section
  if (item.section) {
    if (compacted) {
      return;
    }
    if (role != "ADMIN") {
      return (
        <p className="mt-6 mb-1 px-3 text-gray-600 text-sm uppercase">
          TOOLS & Tracking
        </p>
      );
    }
    return (
      <p className="mt-6 mb-1 px-3 text-gray-600 text-sm uppercase">
        {item.label}
      </p>
    );
  }

  // Main UI
  return (
    <div>
      <div
        onClick={toggleOpen}
        className={cn(
          "flex justify-between items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 cursor-pointer",
          isActive ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
        )}
      >
        {/* render link or icons  menu */}
        <LDiv
          className="flex items-center gap-3 w-full font-medium"
          path={item.path}
        >
          {/* render if icon exist  */}
          {item.icon && (
            <div
              className={cn(
                "flex justify-center items-center rounded-md min-w-8 min-h-8 transition-colors duration-200",
                isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
              )}
            >
              <item.icon className="w-5 h-5" />
            </div>
          )}
          {/* Label of link menu  */}
          <span
            className={cn(
              "opacity-100 text-sm transition-all",
              compacted && "opacity-0"
            )}
          >
            {item.label}
          </span>
        </LDiv>

        {/* downdown arrow  */}
        {item.children && item.children.length > 0 && (
          <ChevronDown
            size={18}
            className={cn(
              "text-gray-500 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </div>

      {/* Loop Nested Menus levels */}
      {item.children && isOpen && !compacted && (
        <div className="flex flex-col mt-1 ml-2 pl-2 border-gray-200 border-l transition-all">
          {item.children.map((child) => (
            <SideBarItems
              role={role}
              key={child.label}
              item={child}
              level={level + 1}
              activePath={activePath}
              compacted={compacted}
            />
          ))}
        </div>
      )}
    </div>
  );
};
