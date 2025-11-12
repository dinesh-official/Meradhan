import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCheck, X } from "lucide-react";
import { ReactNode } from "react";

function LabelView({
  children,
  title,
  className,
  stack,
}: {
  children?: ReactNode;
  title?: string;
  className?: string;
  stack?: "ERROR" | "CHECKED";
}) {
  const renderStack = () => {
    if (stack == "CHECKED") {
      return <CheckCheck size={15} className="text-green-600" />;
    }
    if (stack == "ERROR") {
      return <X size={15} className="text-red-600" />;
    }
  };

  return (
    <div className={cn("flex flex-col gap-1")}>
      <Label className={cn("font-normal text-gray-600 text-xs", className)}>
        {title} {renderStack()}
      </Label>
      {children}
    </div>
  );
}

export default LabelView;
