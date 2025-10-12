"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Activity,
  Heart,
  Flame,
  Star,
  Layers,
  Zap,
} from "lucide-react";

type ArrowType = "up" | "down" | "none";

type StatusCountCardProps = {
  title: string;
  value: string | number;
  changeText?: string; // "+12% from last month" or "-2% from last month"
  arrowType?: ArrowType; // optional: "up", "down", "none"
  variant?:
    | "pinkGradient"
    | "blueGradient"
    | "greenGradient"
    | "orangeGradient"
    | "purpleGradient"
    | "tealGradient"
    | "redGradient"
    | "indigoGradient"
    | "grayGradient"
    | "goldGradient";
};

// Variant Styles
const variantStyles: Record<
  NonNullable<StatusCountCardProps["variant"]>,
  string
> = {
  pinkGradient: "from-pink-500 via-purple-500 to-indigo-500",
  blueGradient: "from-blue-500 via-cyan-500 to-sky-500",
  greenGradient: "from-green-500 via-emerald-500 to-teal-500",
  orangeGradient: "from-orange-500 via-amber-500 to-yellow-500",
  purpleGradient: "from-purple-500 via-fuchsia-500 to-pink-500",
  tealGradient: "from-teal-400 via-cyan-400 to-sky-500",
  redGradient: "from-red-500 via-rose-500 to-pink-600",
  indigoGradient: "from-indigo-500 via-blue-600 to-purple-700",
  grayGradient: "from-gray-500 via-gray-600 to-gray-700",
  goldGradient: "from-yellow-400 via-amber-500 to-orange-500",
};

// Background Icons per Variant
const variantIcons: Record<
  NonNullable<StatusCountCardProps["variant"]>,
  React.ElementType
> = {
  pinkGradient: Heart,
  blueGradient: Users,
  greenGradient: TrendingUp,
  orangeGradient: Briefcase,
  purpleGradient: Activity,
  tealGradient: Layers,
  redGradient: Flame,
  indigoGradient: DollarSign,
  grayGradient: Star,
  goldGradient: Zap,
};

function StatusCountCard({
  title,
  value,
  changeText = "+0%",
  arrowType,
  variant = "pinkGradient",
}: StatusCountCardProps) {
  const Icon = variantIcons[variant];

  // Determine arrow and color
  let arrow = "";
  let arrowColor = "";

  if (arrowType === "up") {
    arrow = "▲";
    arrowColor = "text-green-300";
  } else if (arrowType === "down") {
    arrow = "▼";
    arrowColor = "text-red-300";
  } else if (arrowType === "none") {
    arrow = "";
    arrowColor = "";
  } else {
    // Auto-detect based on changeText
    if (changeText.trim().startsWith("-")) {
      arrow = "▼";
      arrowColor = "text-red-300";
    } else {
      arrow = "▲";
      arrowColor = "text-green-300";
    }
  }

  return (
    <Card className="relative overflow-hidden border-none rounded-2xl ">
      {/* Dynamic Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90 transition-all duration-500",
          variantStyles[variant]
        )}
      ></div>

      {/* Decorative Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_90%)]"></div>

      {/* Background Icon */}
      <div className="absolute right-4 bottom-4 text-white/20">
        <Icon className="w-28 h-28 blur-[1px]" />
      </div>

      {/* Content */}
      <div className="relative p-4 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-5xl font-extrabold tracking-tight drop-shadow-md">
              {value}
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-3">
          <div className="text-sm flex items-center gap-2 font-medium text-white/90">
            {arrow && <span className={arrowColor}>{arrow}</span>}
            {changeText.replace(/^[-+]/, "").trim()}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}

export default StatusCountCard;
