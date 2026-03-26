"use client";
import { userSessionStore } from "@/core/auth/userSessionStore";
import { ISessionResponse } from "@root/apiGateway";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import AuthActions from "./AuthActions";
import MobMenu from "./MobMenu";
import NavMenu from "./NavMenu";
function NavBar({
  session,
}: {
  session: ISessionResponse["responseData"] | null;
}) {
  // save data on session store
  const { setSession } = userSessionStore();

  useEffect(() => {
    setSession(session);
  }, [session, setSession]);

  return (
    <div className="top-0 right-0 left-0 z-50 sticky bg-white shadow shadow-black/10 w-full h-16 md:h-18">
      <div className="mx-auto h-full container">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href={`/`}>
            <Image
              src={`/logo/mera-dhan-logo.svg`}
              width={400}
              height={200}
              alt="meradhan"
              className="w-auto h-10"
            />
          </Link>

          {/* Menu Items */}
          <div className="hidden lg:flex justify-center items-center gap-7">
            <NavMenu />
            <AuthActions session={session} />
          </div>
          <MobMenu session={session} />
        </div>
      </div>
    </div>
  );
}

export default NavBar;
