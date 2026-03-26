import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";
import SideBar from "./SideBar";
import { Role } from "@/global/constants/role.constants";
import { CardTitle } from "@/components/ui/card";

function MobMenuBar({ role }: { role: Role }) {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden cursor-pointer">
        <Menu  className="text-primary"/>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <CardTitle>
            <div className="flex justify-start items-center gap-5 h-full">
              <Image
                src={`/logo/logo.png`}
                alt="meradhan"
                width={500}
                height={500}
                className="w-11 h-11"
              />
              <div className="flex flex-col justify-center items-start">
                <p className="font-bold text-gray-800 text-lg">MeraDhan CRM</p>
                <p className="text-gray-500 text-xs">SEBI Registered OBPP</p>
              </div>
            </div>
          </CardTitle>
        </SheetHeader>
        <SideBar role={role} isMobile={true} />
      </SheetContent>
    </Sheet>
  );
}

export default MobMenuBar;
