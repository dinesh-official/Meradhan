"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { genMediaUrl } from "@/global/utils/url.utils";
import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { useKycStepStore } from "../../../_store/useKycStepStore";
import { addActivityLog } from "@/analytics/UserTrackingProvider";

function IdentityValidationPreviewSign() {
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { state, setStepIndex, prevLocalStep, setStep1SignData } =
    useKycDataStorage();
  const { nextStep } = useKycStepStore();

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Confirm Signature</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex flex-col gap-5">
          <Image
            src={genMediaUrl(state.step_1.sign.url)}
            alt="PAN Card"
            width={1140}
            height={597}
            className="bg-gray-50 border border-gray-200 rounded-2xl w-80 object-cover"
          />
          <div className="flex flex-col gap-2">
            <p
              className="font-medium text-primary text-sm cursor-pointer"
              onClick={() => {
                addAuditLog({
                  type: "RECAPTURE_SIGN",
                  desc: "User chose to recapture the sign during KYC process.",
                });
                prevLocalStep();
              }}
            >
              Remove and Add New Signature
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5 lg:mt-5">
        <Button
          className="flex items-center gap-1 w-full sm:w-auto"
          onClick={() => {
            // this is the last `local step` for "step 1"
            setStepIndex(0);
            // this is the first `global step` for "step 2"
            setStep1SignData("timestamp", new Date().toISOString());
            addAuditLog({
              type: "CONFIRM_SIGN",
              desc: "User confirmed the sign during KYC process.",
            });
            addActivityLog({
              action: "CONFIRM_SIGN",
              details: {
                step: "Sign Verification step",
                Reason: "User Confirmed the Sign",
              },
              entityType: "KYC",
            });
            nextStep();
            pushUserKycState();
          }}
        >
          Confirm & Continue
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>
        <Button
          onClick={async () => {
            const result = await Swal.fire({
              text: "Are you sure you want to save and exit the KYC process?",
              imageUrl: "/images/icons/sad-emoji.svg",
              showCancelButton: true,
              confirmButtonText: "Save & Exit",
              cancelButtonText: "Cancel",
            });

            if (result.isConfirmed) {
              addAuditLog({
                type: "KYC_PROCESS_EXITED",
                desc: "User chose to save and exit the KYC process : Sign Verification step.",
              });

              pushUserKycState({ exit: true });
            }
          }}
          variant={`link`}
        >
          Save & Exit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationPreviewSign;
