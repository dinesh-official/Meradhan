import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { BiCaretUp } from "react-icons/bi";
import {
    FaCheckSquare
} from "react-icons/fa";


export function KycSteListItem({
  icon,
  label,
  isActive,
  isDone,
}: {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  isDone?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex lg:flex-row flex-col items-center gap-3 px-1 py-3 border-gray-200 lg:border-b text-gray-600 text-sm lg:text-left text-center cursor-default select-none",
        isActive && "text-[#0C4580] font-normal",
        isDone && "font-normal text-black"
      )}
    >
      <span className="hidden lg:block">
        {isDone ? <FaCheckSquare className="text-green-600" size={16} /> : icon}
      </span>
      <span>{label}</span>

      {isActive && !isDone && (
        <span className="lg:hidden -bottom-[11px] absolute text-[#0C4580]">
          <BiCaretUp size={30} />
        </span>
      )}

      {isDone && (
        <span className="lg:hidden -bottom-2.5 absolute text-[#0C4580]">
          <FaCheckSquare className="z-20 bg-white text-green-600" size={18} />
        </span>
      )}
    </div>
  );
}