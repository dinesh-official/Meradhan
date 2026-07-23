"use client";

import { cn } from "@/lib/utils";
import { FaCircleCheck } from "react-icons/fa6";

export default function SignupReasonsPanel() {
  return (
    <div className="flex flex-col justify-center items-start gap-3 bg-primary p-10 lg:p-20 w-full h-full">
      <h5 className={cn("text-white text-2xl quicksand-medium")}>
        Reasons to choose MeraDhan
      </h5>
      <ul className="flex flex-col gap-4 mt-2 text-white text-sm">
        <li className="flex items-center gap-3">
          <FaCircleCheck size={18} className="text-secondary shrink-0" /> Easy
          Guides & Articles
        </li>
        <li className="flex items-center gap-3">
          <FaCircleCheck size={18} className="text-secondary shrink-0" />{" "}
          Friendly Interface & Visuals
        </li>
        <li className="flex items-center gap-3">
          <FaCircleCheck size={18} className="text-secondary shrink-0" />{" "}
          Exclusive Learning & Webinars
        </li>
        <li className="flex items-center gap-3">
          <FaCircleCheck size={18} className="text-secondary shrink-0" /> Led by
          Industry Experts
        </li>
        <li className="flex items-center gap-3">
          <FaCircleCheck size={18} className="text-secondary shrink-0" />{" "}
          AI-Powered Learning Support
        </li>
      </ul>
    </div>
  );
}
