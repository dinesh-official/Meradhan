 import { cn } from "@/lib/utils";
import React from "react";

interface GlossaryPostProps {
  heading: string;
  description: string;
}
const GlossaryPost = ({ heading, description }: GlossaryPostProps) => {
  return (
    <div className="flex flex-col gap-3 py-8 border-gray-200 last:border-0 border-b">
      <h4 className={cn("font-medium text-2xl", "quicksand-medium")}>{heading}</h4>
      <p >{description}</p>
    </div>
  );
};

export default GlossaryPost;
