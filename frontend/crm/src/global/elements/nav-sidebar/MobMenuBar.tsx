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

function MobMenuBar({ role }: { role: Role }) {
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer lg:hidden ">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <div className="flex justify-start items-center gap-5 h-full ">
            <Image
              src={`/logo/logo.png`}
              alt="meradhan"
              width={500}
              height={500}
              className="w-11 h-11"
            />
            <div className="flex flex-col justify-center items-start ">
              <p className="font-bold text-lg text-gray-800">MeraDhan CRM</p>
              <p className="text-xs text-gray-500">SEBI Registered OBPP</p>
            </div>
          </div>
        </SheetHeader>
        <SideBar role={role} />
      </SheetContent>
    </Sheet>
  );
}

export default MobMenuBar;
