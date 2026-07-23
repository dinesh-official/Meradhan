"use client";

import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

interface ContactCardProps {
  icon: IconType;
  label: string;
  value: string;
  href?: string;
  iconSize?: number;
  className?: string;
}

export function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  iconSize = 18,
  className,
}: ContactCardProps) {
  const cardContent = (
    <>
      <span className="contact-card-label -top-3 left-3 absolute bg-white px-4">
        {label}
      </span>
      <Icon className="text-secondary" size={iconSize} />
      <span>{value}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cn("contact-card relative flex items-center transition-colors duration-200", className)}
        style={{ gap: "16px", padding: "16px 24px", border: "1px solid #e5e7eb", borderRadius: "6px", maxWidth: "320px", width: "100%" }}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div
      className={cn("contact-card relative flex items-center", className)}
      style={{ gap: "16px", padding: "16px 24px", border: "1px solid #e5e7eb", borderRadius: "6px", maxWidth: "320px", width: "100%" }}
    >
      {cardContent}
    </div>
  );
}
