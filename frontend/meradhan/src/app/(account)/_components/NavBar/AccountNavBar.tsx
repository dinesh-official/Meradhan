"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userSessionStore } from "@/core/auth/userSessionStore";
import { ISessionResponse } from "@root/apiGateway";
import Image from "next/image";
import Link from "next/link";
import { memo, useEffect } from "react";
import { BiSolidFileFind } from "react-icons/bi";
import { FaBell, FaSearch, FaUser } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { MdDashboard, MdLogout } from "react-icons/md";
import { SideBarCollapseButton } from "./ActionSideBar";
import MobSideBar from "./MobSideBar";

function AccountNavBar({
  session,
}: {
  session: ISessionResponse["responseData"] | null;
}) {
  const { setSession } = userSessionStore();

  useEffect(() => {
    setSession(session);
  }, [session, setSession]);

  return (
    <nav
      className="top-0 right-0 left-0 z-50 sticky bg-white shadow shadow-black/10 w-full h-16 md:h-18"
      aria-label="Main Navigation Bar"
    >
      <div className="flex justify-between items-center px-4 md:px-6 h-full">
        {/* Left Section: Logo and Sidebar Controls */}
        <section
          className="flex items-center gap-5 lg:gap-10"
          aria-label="Navigation Controls"
        >
          <SideBarCollapseButton />
          <MobSideBar />
          <Link
            href="/"
            aria-label="Go to homepage"
            className="flex items-center"
          >
            <Image
              src="/logo/mera-dhan-logo.svg"
              width={400}
              height={200}
              alt="Mera Dhan Logo"
              className="w-auto h-8 lg:h-10"
              priority
            />
          </Link>
        </section>

        {/* Right Section: User Actions */}
        <section
          className="flex items-center gap-8"
          aria-label="User Actions Section"
        >
          {/* Action Buttons */}
          <div className="right-0 bottom-0 z-40 fixed sm:relative flex justify-between sm:justify-end items-center gap-8 sm:gap-5 bg-white sm:bg-transparent shadow sm:shadow-none px-4 sm:px-0 py-2 lg:py-0 border-gray-100 sm:border-0 border-t w-full sm:w-auto">
            {/* KYC Button */}
            {session?.kycStatus == "PENDING" && (
              <Link href={`/dashboard/kyc`}>
                <Button
                  variant="secondaryLight"
                  className="gap-3 w-24"
                  aria-label="KYC Verification"
                >
                  <FaUser aria-hidden="true" /> KYC
                </Button>
              </Link>
            )}

            {session?.kycStatus == "UNDER_REVIEW" && (
              <Link href={`/dashboard/kyc`}>
                <Button
                  variant="secondaryLight"
                  className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 gap-2"
                >
                  <BiSolidFileFind />{" "}
                  {session?.isRekycUnderReview || session?.hasRekycExpiredFlow
                    ? "Rekyc: In Review"
                    : "KYC: In Review"}
                </Button>
              </Link>
            )}

            {session?.kycStatus == "RE_KYC" && (
              <Link href={`/dashboard/kyc`}>
                <Button
                  variant="secondaryLight"
                  className="gap-2"
                >
                  <FaUser /> Update KYC
                </Button>
              </Link>
            )}

            {/* Icon Buttons */}
            <div className="flex items-center gap-8 sm:gap-5 lg:gap-10">
              {/* <button
                type="button"
                className="hover:opacity-80 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                aria-label="View Cart"
              >
                <FaCartShopping size={20} aria-hidden="true" />
              </button> */}

              {/* <button
                type="button"
                className="hover:opacity-80 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                aria-label="Search"
              >
                <FaSearch size={20} aria-hidden="true" />
              </button> */}

              {/* <button
                type="button"
                className="relative hover:opacity-80 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-primary"
              >
                <span className="-top-1.5 -right-1 absolute flex justify-center items-center bg-secondary rounded-full w-5 h-5 font-medium text-white text-xs">
                  5
                </span>
                <FaBell size={20} aria-hidden="true" />
              </button> */}
            </div>
          </div>

          {/* Profile Dropdown */}
          {ShowUserBadge(session)}
        </section>
      </div>
    </nav>
  );
}

export default memo(AccountNavBar);
export function ShowUserBadge(
  session: {
    id: number;
    avatar: string | null;
    userName: string;
    emailAddress: string;
    firstName: string;
    middleName: string;
    lastName: string;
  } | null
) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 bg-white rounded-full focus:outline-none cursor-pointer"
          aria-label="Open user menu"
        >
          <Avatar>
            {/* Add avatar image here if needed */}
            {/* <AvatarImage src="https://github.com/shadcn.png" alt="User profile picture" /> */}
            <AvatarFallback aria-hidden="true">
              {session?.firstName.charAt(0)}
              {session?.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <IoIosArrowDown />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        className="shadow-none w-36"
        aria-label="Profile Menu"
      >
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 cursor-pointer"
          >
            <MdDashboard aria-hidden="true" /> Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/logout"
            className="flex items-center gap-2 w-full text-left cursor-pointer"
            aria-label="Logout"
          >
            <MdLogout aria-hidden="true" /> Logout
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
