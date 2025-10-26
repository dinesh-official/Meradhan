"use client";

import { FC, ReactNode, useEffect } from "react";
import { FaChartPie, FaUser } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { HiRectangleStack } from "react-icons/hi2";
import { MdSpaceDashboard } from "react-icons/md";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Menu, X } from "lucide-react";
import { create } from "zustand";
import { usePathname } from "next/navigation";
import Link from "next/link";

// -------------------------
// Zustand store
// -------------------------
interface SidebarState {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: true,
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
}));

// -------------------------
// Menu Data & Types
// -------------------------
interface MenuItem {
  icon: ReactNode;
  label: string;
  href?: string;
}

export const accountMenuItems: MenuItem[] = [
  {
    icon: <MdSpaceDashboard size={19} />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <FaChartPie size={18} />,
    label: "Portfolio",
    href: "/dashboard/portfolio",
  },
  {
    icon: <HiRectangleStack size={18} />,
    label: "My Orders",
    href: "/dashboard/orders",
  },
  {
    icon: <FaSackDollar size={18} />,
    label: "Bond Requests",
    href: "/dashboard/requests",
  },
  { icon: <FaUser size={18} />, label: "Profile", href: "/dashboard/profile" },
];

// -------------------------
// Collapse Button Component
// -------------------------
export const SideBarCollapseButton: FC = () => {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebarStore();

  const handleResize = () => {
    useSidebarStore.setState({ collapsed: true });
  };

  //  handel screen size changes
  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    handleResize();
  }, [pathname]);

  return (
    <div className="hidden lg:flex justify-center items-center">
      <button
        onClick={toggleCollapsed}
        className="flex justify-center items-center transition-all duration-300 cursor-pointer"
      >
        {collapsed ? <Menu /> : <X />}
      </button>
    </div>
  );
};

// -------------------------
// Sidebar Item Component
// -------------------------
interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href?: string;
}

const SidebarItem: FC<SidebarItemProps> = ({ icon, label, href }) => {
  const { collapsed } = useSidebarStore();

  return (
    <Tooltip
      defaultOpen={false}
      open={!collapsed ? false : undefined}
      delayDuration={300}
    >
      <TooltipTrigger asChild disabled={!collapsed}>
        <Link
          href={href || "#"}
          className={`flex items-center h-12 cursor-pointer hover:bg-white hover:text-primary transition-all duration-300 ${
            collapsed ? "justify-center" : "gap-4 px-4"
          }`}
        >
          <span className="flex justify-center items-center w-6">{icon}</span>
          <span
            className={`whitespace-nowrap overflow-hidden transition-all text-sm duration-300 ${
              collapsed ? "opacity-0 max-w-0" : "opacity-100"
            }`}
          >
            {label}
          </span>
        </Link>
      </TooltipTrigger>
      {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  );
};

// -------------------------
// Main Sidebar Component
// -------------------------
const ActionSideBar: FC = () => {
  const { collapsed } = useSidebarStore();

  return (
    <div
      className={`lg:flex hidden flex-col bg-primary text-white border-r shadow-sm z-40 border-gray-100 md:h-[calc(100vh-72px)] h-[calc(100vh-64px)] sticky md:top-18 top-16 transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className="flex flex-col pt-2">
        {accountMenuItems.map((item, i) => (
          <SidebarItem key={i} icon={item.icon} label={item.label} href={item.href}  />
        ))}
      </div>
    </div>
  );
};

export default ActionSideBar;
