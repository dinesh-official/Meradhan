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
    if (role != "ADMIN") {
      return (
        <p className="uppercase px-3 mt-6 text-gray-600  text-sm mb-1 ">
          TOOLS & Tracking
        </p>
      );
    }
    return (
      <p className="uppercase px-3 mt-6 text-gray-600  text-sm mb-1 ">
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
          "flex items-center justify-between gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200",
          isActive ? "bg-primary/10 text-primary" : "hover:bg-gray-100",
          `pl-${level * 5}`
        )}
      >
        {/* render link or icons  menu */}
        <LDiv
          className="flex items-center gap-3 font-medium w-full"
          path={item.path}
        >
          {/* render if icon exist  */}
          {item.icon && (
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200",
                isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
              )}
            >
              <item.icon className="w-5 h-5" />
            </div>
          )}
          {/* Label of link menu  */}
          <span className="text-sm">{item.label}</span>
        </LDiv>

        {/* downdown arrow  */}
        {item.children && item.children.length > 0 && (
          <ChevronDown
            size={18}
            className={cn(
              "transition-transform duration-200 text-gray-500",
              isOpen && "rotate-180"
            )}
          />
        )}
      </div>

      {/* Loop Nested Menus levels */}
      {item.children && isOpen && (
        <div className="flex flex-col mt-1 border-l border-gray-200 ml-2 pl-2">
          {item.children.map((child) => (
            <SideBarItems
              role={role}
              key={child.label}
              item={child}
              level={level + 1}
              activePath={activePath}
            />
          ))}
        </div>
      )}
    </div>
  );
};
