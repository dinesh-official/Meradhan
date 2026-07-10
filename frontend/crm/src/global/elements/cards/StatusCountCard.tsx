"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Activity,
  Briefcase,
  DollarSign,
  File,
  Flame,
  Heart,
  Layers,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React from "react";

// Arrow type
type ArrowType = "up" | "down" | "none";

// Centralized gradient styles
export const variantStyles = {
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
  fileGradient: "from-indigo-800 via-blue-700 to-teal-600",
  cyanGradient: "from-cyan-600 via-sky-500 to-indigo-500",
  limeGradient: "from-lime-500 via-green-400 to-teal-400",
  magentaGradient: "from-fuchsia-600 via-pink-500 to-rose-500",
  sunsetGradient: "from-orange-600 via-pink-500 to-purple-600",
  oceanGradient: "from-blue-800 via-cyan-600 to-teal-500",
  forestGradient: "from-emerald-800 via-green-700 to-lime-600",
  violetGradient: "from-purple-700 via-indigo-600 to-fuchsia-500",
  steelGradient: "from-gray-700 via-gray-600 to-gray-500",
  fireGradient: "from-red-700 via-orange-600 to-yellow-500",
} as const;

// Variant type derived automatically
export type GradientVariant = keyof typeof variantStyles;

// Map icons for each variant
const variantIcons: Record<GradientVariant, React.ElementType> = {
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
  fileGradient: File,
  cyanGradient: Zap,
  limeGradient: Layers,
  magentaGradient: Star,
  sunsetGradient: Flame,
  oceanGradient: Users,
  forestGradient: Heart,
  violetGradient: Activity,
  steelGradient: Briefcase,
  fireGradient: DollarSign,
};

// Props for StatusCountCard
export type StatusCountCardProps = {
  title: string;
  value: string | number;
  changeText?: string; // "+12% from last month" or "-2% from last month"
  arrowType?: ArrowType; // optional: "up", "down", "none"
  variant?: GradientVariant; // all gradient variants supported automatically
  bgIcon?: React.ElementType;
};

function StatusCountCard({
  title,
  value,
  changeText = "+0%",
  arrowType = "none",
  variant = "pinkGradient",
  bgIcon,
}: StatusCountCardProps) {
  const Icon = bgIcon ?? variantIcons[variant];

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
    <Card className="relative overflow-hidden border-none rounded-xl">
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
      <div className="relative p-0 px-3 text-white">
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
