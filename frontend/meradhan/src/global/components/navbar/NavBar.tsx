"use client";
import { userSessionStore } from "@/core/auth/userSessionStore";
import { ISessionResponse } from "@root/apiGateway";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import AuthActions from "./AuthActions";
import MobMenu from "./MobMenu";
import NavMenu from "./NavMenu";
import NavbarBondSearch from "./NavbarBondSearch";
import AccessibilityWidget from "../AccessibilityWidget";
function NavBar({
  session,
}: {
  session: ISessionResponse["responseData"] | null;
}) {
  // save data on session store
  const { setSession } = userSessionStore();

  // Hide the navbar search on the bond listing pages (they have their own search)
  const pathname = usePathname();
  const hideNavbarSearch = [
    "/bonds",
    "/bonds/latest-release",
    "/bonds/bank",
    "/bonds/corporate",
    "/bonds/psu",
    "/bonds/nbfc",
    "/bonds/zero-coupon",
  ].includes(pathname);

  useEffect(() => {
    setSession(session);
  }, [session, setSession]);

  return (
    <nav role="navigation" aria-label="Main navigation" className="meradhan-navbar top-0 right-0 left-0 z-50 sticky bg-white shadow shadow-black/10 w-full h-16 md:h-18">
      <div className="mx-auto h-full container">
        <div className="flex justify-between items-center h-full gap-4">
          {/* Logo */}
          <Link href={`/`} aria-label="MeraDhan Home" className="shrink-0 meradhan-logo">
            <Image
              src={`/logo/mera-dhan-logo.svg`}
              width={400}
              height={200}
              alt="MeraDhan"
              className="w-auto h-10 logo-default"
            />
            <Image
              src={`/logo/meradhan-logo-white.svg`}
              width={400}
              height={200}
              alt="MeraDhan"
              className="w-auto h-10 logo-white"
            />
          </Link>

          {/* Global Bond Search */}
          {!hideNavbarSearch && <NavbarBondSearch />}

          {/* Menu Items */}
          <div className="hidden lg:flex justify-center items-center gap-7 shrink-0">
            <NavMenu />
            <AccessibilityWidget />
            <AuthActions session={session} />
          </div>
          <div className="flex lg:hidden items-center gap-2">
            <AccessibilityWidget />
            <MobMenu session={session} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
