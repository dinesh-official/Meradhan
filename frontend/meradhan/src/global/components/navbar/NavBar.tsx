import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import MobMenu from "./MobMenu";
import NavMenu from "./NavMenu";

function NavBar() {
  return (
    <div className="md:h-18 h-16 w-full shadow  shadow-black/10 bg-white sticky top-0 left-0 z-50 right-0">
      <div className="container mx-auto h-full">
        <div className="flex justify-between items-center h-full ">
          {/* Logo */}
          <Image
            src={`/logo/mera-dhan-logo.svg`}
            width={400}
            height={200}
            alt="meradhan"
            className="w-auto md:h-12 h-10"
          />

          {/* Menu Items */}
          <div className="lg:flex hidden justify-center items-center gap-7 ">
            <NavMenu />
            <Link href="/login" className="text-gray-700">
              Login
            </Link>
            <Button className="px-5">Sign Up</Button>
          </div>
          <MobMenu />
        </div>
      </div>
    </div>
  );
}

export default NavBar;
