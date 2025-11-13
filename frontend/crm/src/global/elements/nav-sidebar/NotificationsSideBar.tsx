import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell } from "lucide-react";

function NotificationsSideBar() {
  return (
    <Sheet>
      <SheetTrigger>
        <div className="relative cursor-pointer">
          <Bell />
          <Badge className="-top-1 -right-0 absolute flex justify-center items-center shadow-none p-0 rounded-full w-4 h-4 text-[10px] leading-2.5">
            1
          </Badge>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

export default NotificationsSideBar;
