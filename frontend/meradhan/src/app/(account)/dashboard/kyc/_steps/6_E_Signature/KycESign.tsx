"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { Loader2 } from "lucide-react";
import { FaDownload } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import { useState } from "react";
import toast from "react-hot-toast";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import { useHandelEsignKyc } from "./_hooks/useHandelEsignKyc";

function KycESign() {
  const { handleEsignKyc, isPending } = useHandelEsignKyc();
  const { state, setStep6Data } = useKycDataStorage();
  const { cookies } = useAppCookie();
  const [clicks, setClicks] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadKycForm = async () => {
    const userId = cookies?.userId;
    if (!userId || clicks >= 3 || isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await apiClientCaller.get<Blob>(
        `/customer/kyc/download-pdf/${userId}`,
        { responseType: "blob" },
      );
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `MeraDhan-KYC-UnsignedForm.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setClicks((c) => c + 1);
    } catch {
      toast.error("Failed to download KYC form. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card accountMode className="gap-0 text-black">
      <CardHeader accountMode className="gap-0 p-0">
        <CardTitle className="font-normal">Kyc Form Generation</CardTitle>
        <CardDescription className="mt-6 p-0">
          KYC form generated successfully. Download the form and review it
          before you proceed to e-sign.
        </CardDescription>
      </CardHeader>
      <CardContent accountMode className="pt-0">
        <div className="flex flex-col">
          <div className="my-6">
            <Button
              type="button"
              size="lg"
              variant="defaultLight"
              className="gap-3 w-56 font-medium"
              disabled={clicks >= 3 || isDownloading || !cookies?.userId}
              onClick={() => void handleDownloadKycForm()}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Generating…
                </>
              ) : (
                <>
                  Download KYC Form
                  <FaDownload aria-hidden />
                </>
              )}
            </Button>
          </div>
          <p className="font-medium text-lg">Final Step - Proceed to e-Sign</p>
          <div className="flex flex-col gap-4 mt-4 text-sm">
            <p>
              You’re almost there! Please agree to the following terms to
              proceed to e-Sign.
            </p>

            <label className="flex items-center gap-2 mt-6">
              <Checkbox
                checked={state?.step_6?.terms}
                onCheckedChange={(e) => { isPending ? toast.error("Please wait for the e-sign process to complete") : setStep6Data("terms", e) }}
              />
              By continue, I agree to the following terms:
            </label>
            <ul className="flex flex-col gap-4 ml-10 list-disc">
              <li>
                I hereby authorize MeraDhan to use my Aadhaar / Virtual ID
                details (as applicable) solely for the purpose of e-Signing my
                KYC / Re-KYC registration.
              </li>
              <li>
                I hereby authorize MeraDhan to share my information with NSE /
                BSE for the facilitation of bond trading.
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5 mt-8">
        <Button
          className="flex items-center gap-1 w-full sm:w-auto"
          onClick={handleEsignKyc}
          disabled={isPending || !state?.step_6?.terms}
        >
          Proceed to e-Sign{" "}
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default KycESign;
