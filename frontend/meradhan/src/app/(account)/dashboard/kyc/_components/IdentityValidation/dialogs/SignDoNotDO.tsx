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
const signGuidelines = {
  dos: [
    "Ensure your signature is clear and legible.",
    "Use a high-resolution image for upload.",
    "Keep the background of the image plain.",
    "Ensure the signature is in black or blue ink.",
  ],
  donts: [
    "Do not upload a blurry or pixelated image.",
    "Avoid colored or patterned backgrounds.",
    "Do not use pencil or light-colored ink.",
    "Avoid cropping or resizing that cuts off parts of the signature.",
  ],
};

export default function SignDoNotDO({
  title = "Signature Guidelines",
  children,
}: {
  title?: string;
  children?: React.ReactNode;
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
            items={signGuidelines.dos}
          />
          <GuidelineList
            title="Don’ts"
            icon={<IoIosCloseCircle size={20} className="text-red-600" />}
            items={signGuidelines.donts}
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
          <li key={idx} className="flex items-start gap-2 text-sm lg:text-base">
            <span className="min-w-5">{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
