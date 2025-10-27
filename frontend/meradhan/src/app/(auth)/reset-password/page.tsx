import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ViewPort from "@/global/components/wrapper/ViewPort";
import Image from "next/image";
import { FaLock } from "react-icons/fa";

function page() {
  return (
    <ViewPort headerOnly>
      <div className="flex justify-center items-center bg-muted py-10 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)]">
        <div className="container">
          <Card className="grid lg:grid-cols-2 p-0 border-0 w-full overflow-hidden">
            <CardContent className="flex flex-col gap-4 p-10 lg:p-14">
              <h3 className="text-2xl">Reset Password?</h3>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Input
                    className="peer bg-muted py-5 ps-12 pe-12 border-none placeholder:text-[#7fabd2]"
                    placeholder="Password*"
                    type="email"
                  />
                  <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-4 text-[#7fabd2] pointer-events-none start-0">
                    <FaLock size={16} aria-hidden="true" />
                  </div>
                </div>
                <div className="relative">
                  <Input
                    className="peer bg-muted py-5 ps-12 pe-12 border-none placeholder:text-[#7fabd2]"
                    placeholder="Confirm Password*"
                    type="email"
                  />
                  <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-4 text-[#7fabd2] pointer-events-none start-0">
                    <FaLock size={16} aria-hidden="true" />
                  </div>
                </div>
                <p  className="text-sm lg:text-base" >
                  *Password should be minimum of 8 characters, and must contain:
                  one uppercase, one lowercase, one special character & one
                  number
                </p>
                <Button className="w-full">Reset Password</Button>
              </div>
            </CardContent>
            <div className="flex justify-center items-center bg-primary py-10 lg:py-10 w-full h-full">
              <Image
                src={`/assets/login.svg`}
                alt="blog"
                width={1200}
                height={800}
                className="w-72 md:w-80 h-auto object-cover"
              />
            </div>
          </Card>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
