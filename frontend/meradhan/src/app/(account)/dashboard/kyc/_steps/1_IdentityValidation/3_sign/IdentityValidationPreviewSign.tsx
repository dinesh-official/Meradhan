"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { MdOutlineArrowRight } from "react-icons/md";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { genMediaUrl } from "@/global/utils/url.utils";
import SignDoNotDO, { signDrawGuidelines } from "../_dialogs/SignDoNotDO";
import { useKycStepStore } from "../../../_store/useKycStepStore";
import Swal from "sweetalert2";

function IdentityValidationPreviewSign() {
  const { pushUserKycState } = useKycDataProvider();
  const { state, setStepIndex, prevLocalStep } = useKycDataStorage();
  const { nextStep } = useKycStepStore();

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Confirm Signature</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex items-center gap-5">
          <Image
            src={genMediaUrl(state.step_1.sign.url)}
            alt="PAN Card"
            width={1140}
            height={597}
            className="bg-gray-50 border border-gray-200 rounded-2xl w-48 object-cover aspect-[4/3]"
          />
          <div>
            <p
              className="font-medium text-primary text-lg cursor-pointer"
              onClick={() => prevLocalStep()}
            >
              Remove and Add New Signature
            </p>
            <SignDoNotDO data={signDrawGuidelines} >
              <p className="text-gray-600 text-sm">(Instructions)</p>
            </SignDoNotDO>
          </div>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5 lg:mt-5">
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            // this is the last `local step` for "step 1"
            setStepIndex(0);
            // this is the first `global step` for "step 2"
            nextStep();
            pushUserKycState();
          }}
        >
          Continue & Confirm <MdOutlineArrowRight />
        </Button>
        <Button
          onClick={async () => {
            const result = await Swal.fire({
              text: "Are you sure you want to exit the KYC process?",
              imageUrl: "/images/icons/sad-emoji.svg",
              showCancelButton: true,
              confirmButtonText: "Yes, Exit",
              cancelButtonText: "Cancel",
            });

            if (result.isConfirmed) {
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
