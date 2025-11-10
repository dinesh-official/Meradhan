import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function BondInfoLabel({
  children,
  title,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label className="font-normal text-gray-600">{title}</Label>
      {children}
    </div>
  );
}
