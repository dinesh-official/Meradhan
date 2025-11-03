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
      <span className="-top-3 left-3 absolute bg-white px-4">
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
        className={cn(
          "relative flex items-center gap-4 p-4 px-6 border border-gray-200 rounded-md w-full min-[1200px]:w-80 transition-colors duration-200",
          className
        )}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 p-4 px-6 border border-gray-200 rounded-md w-full min-[1200px]:w-80",
        className
      )}
    >
      {cardContent}
    </div>
  );
}
