"use client";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import EmailInputStep from "./_components/EmailInputStep";
import OtpInputStep from "./_components/OtpInputStep";
import { useLoginHook } from "./_hooks/useLoginHook";

function LoginPage() {
  const { actions, state } = useLoginHook();
  return (
    <div className="w-full h-screen min-h-[800px] bg-gray-50 flex justify-center items-center flex-col gap-4 pt-6">
      <Card className="w-[400px] border-0">
        <CardContent>
          <Image
            alt="logo"
            src={`/logo/logo.png`}
            width={300}
            height={300}
            className="w-16 h-16 mx-auto mt-2"
          />
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl text-center font-semibold">MeraDhan CRM</h2>
            <p className="text-center text-sm text-gray-500">
              SEBI Registered OBPP - Secure Login
            </p>
          </div>
          {state.step.value == "EMAIL" && (
            <EmailInputStep
              onChange={state.email.setEmail}
              value={state.email.value}
              onSubmit={actions.handelEmailSubmit}
              // isLoading={}
            />
          )}
          {state.step.value == "OTP" && (
            <OtpInputStep
              email={state.email.value}
              onBack={() => state.step.setStep("EMAIL")}
              onChange={state.otp.setOtp}
              value={state.otp.value}
              onSubmit={actions.handelOtpSubmit}
              // isLoading={}
            />
          )}
          <div className="mt-7 text-center">
            <p className="text-xs text-gray-500">
              Need help?{" "}
              <a href="#" className="text-primary font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-gray-500 mt-3">
        Protected by industry-standard encryption
      </p>
    </div>
  );
}

export default LoginPage;
