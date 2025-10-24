import { Button } from "@/components/ui/button";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import { IoShareSocialSharp } from "react-icons/io5";

function InfoLabel() {
  return (
    <div>
      <p className="text-xs text-gray-800">
        Coupon <span className="font-bold">%</span>
      </p>
      <p className="font-medium">8.9%</p>
    </div>
  );
}

export function IssuerNoteCard({ gridMode }: { gridMode?: boolean }) {
  return (
    <div
      className={cn(
        "w-full flex border lg:flex-row flex-col border-gray-200 p-5 px-6 rounded-lg lg:gap-10 gap-5",
        gridMode && "flex-col gap-5"
      )}
    >
      <div className=" w-20 flex justify-center items-center ">
        <Image
          src="/avatars/sebi_logo_18a35a5d3f.png"
          width={200}
          height={200}
          alt="No found"
          className="min-w-16 h-auto"
        />
      </div>
      <div className="w-full flex flex-col gap-5">
        <div className="flex justify-between items-center w-full">
          <h5
            className={cn(
              "text-2xl font-semibold text-primary",
              quicksand.className
            )}
          >
            ICICI HOME FINANCE COMPANY LIMITED
          </h5>
          {!gridMode && (
            <IoShareSocialSharp size={23} className="lg:block hidden" />
          )}
        </div>

        <div
          className={cn(
            "flex justify-between  items-center lg:flex-row flex-col",
            gridMode && "flex-col"
          )}
        >
          <div
            className={cn(
              "grid lg:grid-cols-4 grid-cols-2 gap-3 w-full",
              gridMode && "gap-5 grid-cols-2"
            )}
          >
            <InfoLabel></InfoLabel>
            <InfoLabel></InfoLabel>
            <InfoLabel></InfoLabel>
            <InfoLabel></InfoLabel>
          </div>
          <div
            className={cn(
              "flex lg:justify-end lg:mt-0 mt-5 items-center lg:w-auto w-full",
              gridMode && "mt-5 flex justify-start w-full"
            )}
          >
            <Button
              variant={`secondary`}
              className={cn(
                "bg-muted text-primary hover:text-white font-medium lg:w-auto w-full",
                gridMode && "w-full"
              )}
            >
              View Notes <IoMdArrowDropright className="text-secondary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
