import { Card, CardContent } from "@/components/ui/card";
import ViewPort from "@/global/components/wrapper/ViewPort";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "../_components/LoginForm";

function page() {
  return (
    <ViewPort headerOnly>
      <div className="bg-muted md:min-h-[calc(100vh-72px)]  min-h-[calc(100vh-64px)] flex justify-center items-center py-10">
        <div className="container">
          <Card className="w-full border-0 grid lg:grid-cols-2 p-0 overflow-hidden">
            <CardContent className="lg:p-14  p-10 flex flex-col gap-4 ">
              <h3 className="text-2xl">Login</h3>
              <p>Welcome Back!</p>
              <LoginForm />
              <div className="text-center mt-2">
                New User?{" "}
                <Link className="font-semibold text-primary" href={"/signup"}>
                  Sign Up
                </Link>
              </div>
              <div className="text-center">
                <Link href={`#`} className="text-primary">
                  Privacy Policy
                </Link>{" "}
                |{" "}
                <Link href={`#`} className="text-primary">
                  Terms of Use
                </Link>
              </div>
            </CardContent>
            <div className="bg-primary flex justify-center items-center w-full h-full  lg:py-20 py-14">
              <Image
                src={`/assets/login.svg`}
                alt="blog"
                width={1200}
                height={800}
                className="md:w-80 w-72 h-auto object-cover"
              />
            </div>
          </Card>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
