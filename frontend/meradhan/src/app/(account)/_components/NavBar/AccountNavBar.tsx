"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { FaBell, FaSearch, FaUser } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { SideBarCollapseButton } from "./ActionSideBar";
import MobSideBar from "./MobSideBar";
import { memo } from "react";

function AccountNavBar() {
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
            <Button
              variant="secondaryLight"
              className="gap-3 w-24"
              aria-label="KYC Verification"
            >
              <FaUser aria-hidden="true" /> KYC
            </Button>

            {/* Icon Buttons */}
            <div className="flex items-center gap-8 sm:gap-5 lg:gap-10">
              <button
                type="button"
                className="hover:opacity-80 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                aria-label="View Cart"
              >
                <FaCartShopping size={20} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="hover:opacity-80 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                aria-label="Search"
              >
                <FaSearch size={20} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="relative hover:opacity-80 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-primary"
              >
                <span
                  className="-top-1.5 -right-1 absolute flex justify-center items-center bg-secondary rounded-full w-5 h-5 font-medium text-white text-xs"
                >
                  5
                </span>
                <FaBell size={20} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Open user menu"
              >
                <Avatar>
                  {/* Add avatar image here if needed */}
                  {/* <AvatarImage src="https://github.com/shadcn.png" alt="User profile picture" /> */}
                  <AvatarFallback aria-hidden="true">SB</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              align="end"
              className="shadow-none"
              aria-label="Profile Menu"
            >
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <FaUser aria-hidden="true" /> Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 w-full text-left"
                  aria-label="Logout"
                >
                  <MdLogout aria-hidden="true" /> Logout
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
      </div>
    </nav>
  );
}

export default memo(AccountNavBar);
