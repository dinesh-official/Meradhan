"use client";
import { useEffect, useState } from "react";

const navItems = [
  { id: "personal-info", label: "Personal Information" },
  { id: "identity-docs", label: "Identity Documents" },
  { id: "pan-details", label: "PAN Details" },
  { id: "aadhaar-address", label: "Aadhaar & Address" },
  { id: "demat-accounts", label: "Demat Accounts" },
  { id: "bank-accounts", label: "Bank Accounts" },
  { id: "risk-profile", label: "Risk Profile" },
  { id: "compliance", label: "Compliance" },
];

export default function StickyHeader() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const options = {
      root: null,
      rootMargin: "0px 0px -70% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, options);

    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="-top-8 z-40 sticky flex flex-row justify-start items-center gap-7 bg-white px-7 pt-4 lg:pt-0 border border-gray-100 rounded-lg w-full h-11 overflow-auto text-gray-700 text-nowrap select-none">
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`font-medium text-xs transition-all cursor-pointer ${
            activeId === item.id
              ? "text-primary"
              : "hover:text-primary"
          }`}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
