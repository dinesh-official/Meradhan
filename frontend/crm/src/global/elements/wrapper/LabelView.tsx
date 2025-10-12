import { Label } from "@/components/ui/label";
import React, { ReactNode } from "react";

function LabelView({
  children,
  title,
}: {
  children?: ReactNode;
  title?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-gray-600 font-normal">{title}</Label>
      {children}
    </div>
  );
}

export default LabelView;
