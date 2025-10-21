import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import LoginForm from "./LoginForm";

function LoginPage() {
  return (
    <div className="relative w-full h-screen flex justify-center items-center overflow-hidden bg-[#f4f7fa]">
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
      <div className="relative z-10 flex flex-col justify-center items-center gap-4 w-full px-4">
        <Card className="w-full max-w-[400px] bg-white backdrop-blur-xl  border border-gray-400/20 rounded-2xl">
          <CardContent className="p-6">
            <Image
              alt="logo"
              src="/logo/logo.png"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl text-center font-semibold text-gray-800">
                MeraDhan CRM
              </h2>
              <p className="text-center text-sm text-gray-500">
                SEBI Registered OBPP - Secure Login
              </p>
            </div>

            {/* Logic Component */}
            <div className="mt-6">
              <LoginForm />
            </div>

            <div className="mt-7 text-center">
              <p className="text-xs text-gray-500">
                Need help?{" "}
                <a
                  href="#"
                  className="text-primary font-medium hover:underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-300 mt-3">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
