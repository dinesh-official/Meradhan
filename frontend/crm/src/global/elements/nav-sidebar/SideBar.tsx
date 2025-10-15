"use client";
import { Role } from "@/global/constants/role.constants";
import { useNavBarToggleStore } from "@/global/stores/useNavBarToggleStore";
import { generateNavItemsByRole } from "@/global/utils/role.utils";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { SideBarItems } from "./SidebarItems";

function SideBar({
  role,
  isMobile = false,
}: {
  role: Role;
  isMobile?: boolean;
}) {
  const activePath = usePathname();
  const { isOpen } = useNavBarToggleStore();
  const navItems = useMemo(() => generateNavItemsByRole(role), [role]);
  const [tmpNavOpen, setTmpNavOpen] = useState(false);

  const hoverOpenTimer = useRef<NodeJS.Timeout | null>(null);
  const hoverCloseTimer = useRef<NodeJS.Timeout | null>(null);

  const showCompacted = useCallback(() => {
    if (isMobile) {
      return true;
    }
    return tmpNavOpen || isOpen;
  }, [tmpNavOpen, isOpen, isMobile]);

  const handleMouseEnter = () => {
    if (isOpen || isMobile) return;

    // Cancel any pending close timer
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }

    // Start delayed open timer (3 sec)
    hoverOpenTimer.current = setTimeout(() => {
      setTmpNavOpen(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (isOpen || isMobile) return;

    // Cancel any pending open timer
    if (hoverOpenTimer.current) {
      clearTimeout(hoverOpenTimer.current);
      hoverOpenTimer.current = null;
    }

    // Start delayed close timer (3 sec)
    hoverCloseTimer.current = setTimeout(() => {
      setTmpNavOpen(false);
    }, 500);
  };

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "lg:w-[73px] h-[calc(100vh-65px)] transition-all overflow-hidden flex text-nowrap select-none sticky top-[65px] left-0 flex-col bg-white lg:border-r border-gray-100 p-3 overflow-y-auto font-medium",
        (isOpen || tmpNavOpen || isMobile) && "lg:w-[270px]"
      )}
    >
      {navItems.map((item, i) => (
        <SideBarItems
          compacted={!showCompacted()}
          role={role}
          key={item.label + i}
          item={item}
          activePath={activePath}
        />
      ))}
    </aside>
  );
}

export default memo(SideBar);
