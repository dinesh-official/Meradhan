import { useMemo } from "react";
import { Badge } from "@/components/ui/badge"; // adjust path as needed
import { cn } from "@/lib/utils";

/**
 * Returns Tailwind classes for each user role badge.
 */
function getStatusClass(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-orange-100 text-orange-700 ";
    case "SALES":
      return "bg-green-100 text-green-700 ";
    case "SUPPORT":
      return "bg-blue-100 text-blue-700";
    case "RELATIONSHIP_MANAGER":
      return "bg-purple-100 text-purple-700";
    case "VIEWER":
    default:
      return "bg-gray-100 text-gray-700 ";
  }
}

export default function UserRoleBadge({ value, className }: { value: string, className?: string }) {
  const cls = useMemo(() => getStatusClass(value), [value]);

  return (
    <Badge className={cn(`px-2 rounded text-xs font-medium`, cls, className)}>
      {value.replaceAll("_", " ")}
    </Badge>
  );
}
