import { Card, CardContent } from "@/components/ui/card";
import ViewPort from "@/global/components/wrapper/ViewPort";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "./LoginForm";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";
export const revalidate = 0; // Revalidate the page every hour

export const generateMetadata = async () => {
  return await generatePagesMetaData("login");
};

function page() {
  return (
    <ViewPort headerOnly>
      <div className="flex justify-center items-center bg-muted py-10 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)]">
        <div className="container">
          <Card className="grid lg:grid-cols-2 p-0 border-0 w-full overflow-hidden">
            <CardContent className="flex flex-col gap-4 md:px-14 px-6  py-14">
              <h3 className="text-2xl">Login</h3>

              <LoginForm />
              <div className="mt-2 text-center">
                New User?{" "}
                <Link className="font-semibold text-primary" href={"/signup"}>
                  Sign Up
                </Link>
              </div>
              <div className="text-center">
                <Link
                  href={`/privacy-policy`}
                  target="_blank"
                  className="text-primary"
                >
                  Privacy Policy
                </Link>{" "}
                |{" "}
                <Link
                  href={`/terms-of-use`}
                  target="_blank"
                  className="text-primary"
                >
                  Terms of Use
                </Link>
              </div>
            </CardContent>
            <div className="flex justify-center items-center bg-primary py-14 lg:py-20 w-full h-full">
              <Image
                src={`/static/login.svg`}
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
