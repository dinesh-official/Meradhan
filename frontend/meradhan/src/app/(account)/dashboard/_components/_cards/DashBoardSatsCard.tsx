import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function DashBoardSatsCard({
  children,
  icon,
  title,
  className,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("bg-muted border-none rounded-lg", className)}>
      <CardHeader className="flex justify-between items-center">
        <p>{title}</p>
        {icon}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
