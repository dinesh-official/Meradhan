"use client";
import { generateNavItemsByRole } from "@/global/utils/role.utils";
import { usePathname } from "next/navigation";
import { SideBarItems } from "./SidebarItems";
import { Role } from "@/global/constants/role.constants";
import { memo, useMemo } from "react";

function SideBar({ role }: { role: Role }) {
  const activePath = usePathname(); // Replace with your router path

  const navItems = useMemo(() => generateNavItemsByRole(role), [role]);

  return (
    <aside className="lg:w-[280px] h-[calc(100vh-65px)]  flex  select-none sticky top-[65px] left-0 flex-col bg-white lg:border-r border-gray-100 p-3 overflow-y-auto font-medium">
      {navItems.map((item, i) => (
        <SideBarItems
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
