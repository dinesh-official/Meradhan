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
import { API_SERVER_URL } from "@/global/constants/domains";
import useAppCookie from "@/hooks/useAppCookie.hook";
import Link from "next/link";
import { FaDownload } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import { useHandelEsignKyc } from "./_hooks/useHandelEsignKyc";

function KycESign() {
  const { handleEsignKyc, isPending } = useHandelEsignKyc();
  const { state, setStep6Data } = useKycDataStorage();
  const { cookies } = useAppCookie();

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Kyc Form Generation</CardTitle>
        <CardDescription className="text-black">
          KYC form generated successfully. Download the form and review it
          before you proceed to e-sign.
        </CardDescription>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex flex-col gap-3">
          <Link
            href={`${API_SERVER_URL}/customer/kyc/download-pdf/${cookies?.userId}`}
            target="_blank"
          >
            <Button
              size={`lg`}
              variant={`defaultLight`}
              className="gap-5 w-56 font-medium"
            >
              Download KYC Form <FaDownload />{" "}
            </Button>
          </Link>
          <p className="font-medium text-lg">Final Step - Proceed to e-Sign</p>
          <p>
            You’re almost there! Please agree to the following terms to proceed
            to e-Sign.
          </p>

          <label className="flex items-center gap-2">
            <Checkbox
              checked={state?.step_6?.terms}
              onCheckedChange={(e) => setStep6Data("terms", e)}
            />
            By continue, I agree to the following terms:
          </label>
          <ul className="flex flex-col gap-1 ml-10 list-disc">
            <li>
              I hereby authorize MeraDhan to use my Aadhaar / Virtual ID details
              (as applicable) solely for the purpose of e-Signing my KYC /
              Re-KYC registration.
            </li>
            <li>
              I hereby authorize MeraDhan to share my information with NSE / BSE
              for the facilitation of bond trading.
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          className="w-full sm:w-auto"
          onClick={handleEsignKyc}
          disabled={isPending || !state?.step_6?.terms}
        >
          Proceed to e-Sign  <div className="flex justify-center items-center p-0 h-full">
                      <IoMdArrowDropright className="p-0 text-4xl" />
                    </div>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default KycESign;
