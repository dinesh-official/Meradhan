"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { ReactNode } from "react";
import Link from "next/link";
import { useLogoutActionHook } from "./useLogoutActionHook";
function ProfileToggleAction({
  children,
  id,
}: {
  children: ReactNode;
  id: number;
}) {
  const { handelLogout, mutateLogout } = useLogoutActionHook(id);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-0">
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="flex justify-start items-center group gap-3">
          <Link href="/dashboard/profile">
            <User className="group hover:text-primary" /> My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={mutateLogout.isPending}
          onClick={handelLogout}
          className="flex justify-start items-center group gap-3"
        >
          <LogOut size={10} className="group hover:text-primary" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileToggleAction;
