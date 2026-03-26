"use client";

import React, { useRef, useEffect } from "react";

interface TabsProps {
  tabs: string[];
  active?: string;
  onChange?: (tab: string, index: number) => void;
  className?: string;
}

export const ProfileTabs: React.FC<TabsProps> = ({
  tabs,
  active,
  onChange,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const handleTabClick = (tab: string, index: number) => {
    onChange?.(tab, index);

    // Scroll clicked tab into center
    const tabElement = tabRefs.current[index];
    if (tabElement) {
      tabElement.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  // Optional: Auto-center active tab on load
  useEffect(() => {
    const index = tabs.indexOf(active || "");
    if (index !== -1) {
      const tabElement = tabRefs.current[index];
      if (tabElement) {
        tabElement.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [active, tabs]);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto scrollbar-hide">
      <div
        className={`relative flex justify-start items-center gap-2 md:gap-5 border-gray-200 border-b-[4px] w-full  text-sm font-semibold text-gray-600 text-nowrap select-none ${
          className || ""
        }`}
      >
        {tabs.map((tab, i) => (
          <p
            key={tab}
            ref={(el) => {
              tabRefs.current[i] = el; // ✅ fixed: no return value
            }}
            onClick={() => handleTabClick(tab, i)}
            className={`py-2 cursor-pointer transition-all duration-200 -mb-[3px] border-b-[4px] ${
              active === tab
                ? "text-primary border-transparent active-tab"
                : "border-transparent hover:text-primary text-[#666666]"
            }`}
          >
            {tab}
          </p>
        ))}
      </div>
    </div>
  );
};
