import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { genMediaUrl } from "@/global/utils/url.utils";
import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { KycSelfieGuide } from "./IdentityValidationCaptureSelfie";
import { addActivityLog } from "@/analytics/UserTrackingProvider";
function IdentityValidationSelfiePreview() {
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { state, nextLocalStep, prevLocalStep, setStep1SelfieFaceData } =
    useKycDataStorage();

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Confirm Selfie</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex items-center gap-5">
          <Image
            src={genMediaUrl(state.step_1.face.url)}
            alt="face"
            width={1140}
            height={597}
            className="bg- border border-gray-200 rounded-2xl w-48 object-cover aspect-[3/4]"
          />
          <div>
            <p
              className="font-medium text-primary text-sm cursor-pointer"
              onClick={() => {
                addAuditLog({
                  type: "RECAPTURE_SELFIE",
                  desc: "User chose to recapture the selfie during KYC process.",
                });
                addActivityLog({
                  action: "RECAPTURE_SELFIE",
                  details: {
                    step: "Selfie Verification step ",
                    Reason: "User Recaptured the Selfie",
                  },
                  entityType: "KYC",
                });
                prevLocalStep();
              }}
            >
              Recapture
            </p>

            <Dialog>
              <DialogTrigger>
                <p className="text-gray-600 text-xs cursor-pointer">
                  (Instructions)
                </p>
              </DialogTrigger>
              <DialogContent className="lg:min-w-[800px]">
                <KycSelfieGuide />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5 lg:mt-5">
        <Button
          className="flex items-center gap-1 w-full sm:w-auto"
          onClick={() => {
            addAuditLog({
              type: "CONFIRM_SELFIE",
              desc: "User confirmed the selfie during KYC process.",
            });
            setStep1SelfieFaceData("timestamp", new Date().toISOString());
            addActivityLog({
              action: "CONFIRM_SELFIE",
              details: {
                step: "Selfie Verification step ",
                Reason: "User Confirmed the Selfie",
              },
              entityType: "KYC",
            });
            nextLocalStep();
            pushUserKycState();
          }}
        >
          Confirm & Continue
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>
        <Button
          variant={`link`}
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
                desc: "User chose to save and exit the KYC process : Selfie Verification step.",
              });
              pushUserKycState({ exit: true });
            }
          }}
        >
          Save & Exit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationSelfiePreview;
