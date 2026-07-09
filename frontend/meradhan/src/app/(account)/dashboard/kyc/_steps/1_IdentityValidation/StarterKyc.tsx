"use client";
import { addActivityLog } from "@/analytics/UserTrackingProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycStepStore } from "../../_store/useKycStepStore";

function StarterKyc() {
  const apiClient = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const { cookies } = useAppCookie();
  const { nextStep } = useKycStepStore();

  const profileData = useQuery({
    queryKey: ["getProfileDataForKyc"],
    queryFn: async () => {
      const response = await apiClient.customerInfoById(cookies.userId || "");
      return response.data.responseData;
    },
  });

  const isAllowTOProcess = () => {
    if (profileData.data?.utility.isPhoneVerified === false) {
      Swal.fire({
        imageUrl: "/images/icons/sad-emoji.svg",
        title: "Phone Verification Required",
        text: "Your phone is not verified. Please verify it from your Profile page to continue with KYC.",
        confirmButtonText: "Go to Profile",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/dashboard/profile";
        }
      });
      return false;
    } else if (profileData.data?.utility.isEmailVerified === false) {
      Swal.fire({
        imageUrl: "/images/icons/sad-emoji.svg",
        title: "Email Verification Required",
        text: "Your email is not verified.Please verify it from your Profile page to continue with KYC.",
        confirmButtonText: "Go to Profile",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/dashboard/profile";
        }
      });
      return false;
    }
    addActivityLog({
      action: "KYC_PROCESS_STARTED",
      details: {
        step: "Starter KYC",
      },
      entityType: "KYC",
    });
    nextStep();
  };

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">
          1. Documents & Details Needed
        </CardTitle>
      </CardHeader>

      <CardContent accountMode className="pb-0">
        <div className="space-y-4">
          <p className="mb-4 text-sm">
            Please keep the following ready before you start:
          </p>

          <ul className="space-y-2">
            <li className="flex items-start text-sm">
              <span className="mr-2">•</span>
              <span>PAN Card</span>
            </li>
            <li className="flex items-start text-sm">
              <span className="mr-2">•</span>
              <span>Aadhaar (mobile-linked) for DigiLocker verification</span>
            </li>
            <li className="flex items-start text-sm">
              <span className="mr-2">•</span>
              <span>Bank Details (Account No., IFSC)</span>
            </li>
            <li className="flex items-start text-sm">
              <span className="mr-2">•</span>
              <span>Demat Details (DP ID & Client ID – NSDL/CDSL)</span>
            </li>
            <li className="flex items-start text-sm">
              <span className="mr-2">•</span>
              <span>Signature (to draw or upload)</span>
            </li>
            <CardTitle className="mt-6 mb-6 font-normal">
              2. Device & Access Requirements
            </CardTitle>
            <p className="mb-4 text-sm">Before you proceed, please ensure:</p>
            <li className="flex items-start text-sm">
              <span className="mr-2">•</span>
              <span>Your mobile number and email are verified on MeraDhan</span>
            </li>

            <li className="flex items-start text-sm">
              <span className="mr-2">•</span>
              <span>
                Your device has a working camera for selfie & liveness check
              </span>
            </li>
            <li className="flex items-start text-sm">
              <span className="mr-2">•</span>
              <span>Location Services are enabled on your device</span>
            </li>
          </ul>
        </div>
      </CardContent>

      <CardFooter accountMode className="sm:flex-row flex-col gap-5 mt-4 pt-0">
        <Button onClick={isAllowTOProcess} className="gap-1">
          Start KYC Process{" "}
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default StarterKyc;
