import { Card, CardContent } from "@/components/ui/card";
import ViewPort from "@/global/components/wrapper/ViewPort";
import Image from "next/image";
import Link from "next/link";
import ForgetPasswordForm from "./ForgetPasswordForm";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";
export const revalidate = 0; // Revalidate the page every hour

export const generateMetadata = async () => {
  return await generatePagesMetaData("forgot-password");
};
function page() {
  return (
    <ViewPort headerOnly>
      <div className="flex justify-center items-center bg-muted py-10 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)]">
        <div className="container">
          <Card className="grid lg:grid-cols-2 p-0 border-0 w-full overflow-hidden">
            <CardContent className="flex flex-col gap-4 p-10 lg:p-14">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl">Forgot Password?</h3>
                <p>Please enter your email to receive a password reset link.</p>
              </div>
              <ForgetPasswordForm />
              <div className="flex justify-center items-center gap-2 mt-2 text-center">
                Remember Password?
                <Link className="font-semibold text-primary" href={"/login"}>
                  Login
                </Link>
              </div>
            </CardContent>
            <div className="flex justify-center items-center bg-primary py-10 lg:py-10 w-full h-full">
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
