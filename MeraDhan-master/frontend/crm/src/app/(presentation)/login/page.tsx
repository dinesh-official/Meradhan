import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import LoginForm from "./LoginForm";

function LoginPage() {
  return (
    <div className="relative flex justify-center items-center bg-[#f4f7fa] w-full h-screen overflow-hidden">
      {/* Background image */}
      {/* <div className="absolute inset-0">
        <Image
          src="/images/dubai-city.jpg" 
          alt="background"
          fill
          className="object-cover"
          priority
        />
<HiHome />
        <div className="absolute inset-0 bg-black/10 backdrop-brightness-50" />
      </div> */}

      {/* Main content */}
      <div className="z-10 relative flex flex-col justify-center items-center gap-4 px-4 w-full">
        <Card className="bg-white backdrop-blur-xl border border-gray-400/20 rounded-2xl w-full max-w-[500px]">
          <CardContent className="p-6">
            <Image
              alt="logo"
              src="/logo/logo.png"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-gray-800 text-2xl text-center">
                MeraDhan CRM
              </h2>
              <p className="text-gray-500 text-sm text-center">
                SEBI Registered OBPP - Secure Login
              </p>
            </div>

            {/* Logic Component */}
            <div className="mt-6">
              <LoginForm />
            </div>
          </CardContent>
        </Card>

        <p className="mt-3 text-gray-300 text-xs text-center">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
