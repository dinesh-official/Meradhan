import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import apiServerCaller from "@/core/connection/apiServerCaller";
import ViewPort from "@/global/components/wrapper/ViewPort";
import apiGateway from "@root/apiGateway";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 0; // No revalidation (server-rendered every time)

async function page({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const token = (await searchParams)?.token;

  const customerApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiServerCaller
  );

  let verified = false;
  let errorMessage = "";

  try {
    if (!token) {
      throw new Error("Missing verification token.");
    }

    // Attempt to verify the email
    await customerApi.verifyEmail(token);
    verified = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Email verification error:", error);
    errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to verify email. Please try again later.";
  }

  return (
    <ViewPort headerOnly>
      <div className="flex justify-center items-center bg-muted py-10 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)]">
        <div className="container">
          <Card className="grid lg:grid-cols-2 p-0 border-0 w-full overflow-hidden">
            <CardContent className="flex flex-col justify-between gap-4 p-10 lg:p-14">
              {verified ? (
                <div className="flex flex-col justify-between gap-4">
                  <h3 className="font-semibold text-green-600 text-2xl">
                    Email verified
                  </h3>
                  <p>Your email has been successfully verified.</p>
                  <Link href="/login">
                    <Button>Go to Login</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col justify-between gap-4">
                  <h3 className="font-semibold text-red-600 text-2xl">
                    Verification failed
                  </h3>
                  <p>{errorMessage}</p>
                  <Link href="/">
                    <Button variant="outline">Go Back</Button>
                  </Link>
                </div>
              )}
            </CardContent>

            <div className="flex justify-center items-center bg-primary py-10 lg:py-10 w-full h-full">
              <Image
                src={`/static/login.svg`}
                alt="Email Verification"
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
