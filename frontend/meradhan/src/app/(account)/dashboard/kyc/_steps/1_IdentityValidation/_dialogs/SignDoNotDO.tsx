import React from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { IoIosCloseCircle } from "react-icons/io";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Configurable data for Do's and Don'ts
export const signDrawGuidelines = {
  dos: [
    "Draw your signature smoothly and completely within the provided box.",
    "Use a stylus, mouse, or fingertip for better control.",
    "Match your drawn signature exactly with your official records.",
    "Ensure strokes are clear, continuous, and visible.",
    "Practice once if needed before submitting.",
  ],
  donts: [
    "Don’t go outside the drawing box.",
    "Don’t make the signature too small or too large.",
    "Don’t create initials or scribbles if your PAN signature is full name (and vice versa).",
    "Don’t lift your finger/stylus excessively, causing broken strokes.",
    "Don’t draw symbols, shapes, or marks that are different from your registered signature.",
  ],
};


export const signUploadGuidelines = {
  dos: [
    "Upload a clear, high-quality image of your signature.",
    "Sign on plain white paper before scanning or clicking a photo.",
    "Use dark blue or black ink for best visibility.",
    "Keep your signature straight, centered, and within the frame.",
    "Ensure the image is well-lit, without shadows or glare.",
    "Match your signature exactly with your PAN Card/KYC records.",
    "Crop the image so only the signature area is visible.",
  ],
  donts: [
    "Don’t upload blurred, tilted, or low-resolution image.",
    "Don’t use colored backgrounds, ruled paper, or textured surfaces.",
    "Don’t upload signature with shadows, flash reflections, or watermarks.",
    "Don’t alter or edit the signature digitally.",
    "Don’t upload signature different from your official KYC signature.",
  ],
};


export default function SignDoNotDO({
  title = "Signature Guidelines",
  children,
   data
}: {
  title?: string;
    children?: React.ReactNode;
  data: typeof signDrawGuidelines | typeof signUploadGuidelines;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="cursor-pointer">{children}</span>
      </DialogTrigger>

      <DialogContent className="p-0 min-w-[50vw]">
        <DialogHeader className="border-gray-200 border-b">
          <p className="p-4 px-8">{title}</p>
        </DialogHeader>

        <div className="gap-4 lg:gap-8 grid lg:grid-cols-2 px-8 pb-4">
          <GuidelineList
            title="Do’s"
            icon={<FaCircleCheck className="text-green-600" />}
            items={data.dos}
          />
          <GuidelineList
            title="Don’ts"
            icon={<IoIosCloseCircle size={18} className="text-red-600" />}
            items={data.donts}
          />
        </div>

        <DialogFooter className="px-4 py-3 border-gray-200 border-t">
          <DialogTrigger asChild>
            <Button variant="link" className="text-gray-900">
              Close
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GuidelineList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div>
      <p className="font-medium text-lg">{title}</p>
      <ul className="flex flex-col gap-3 mt-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="mt-1 min-w-5">{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
