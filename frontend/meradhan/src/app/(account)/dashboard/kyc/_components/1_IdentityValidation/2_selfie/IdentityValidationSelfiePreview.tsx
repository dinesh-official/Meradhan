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

function IdentityValidationSelfiePreview() {
  const { pushUserKycState } = useKycDataProvider();
  const { state, nextLocalStep,prevLocalStep } = useKycDataStorage();
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Confirm Selfie</CardTitle>
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
            <p className="font-medium text-primary text-lg cursor-pointer" onClick={()=>prevLocalStep()} >Recapture</p>
            <p className="text-gray-600 text-sm">(Instructions)</p>
          </div>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5 lg:mt-5">
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            nextLocalStep();
            pushUserKycState();
          }}
        >
          Continue & Confirm <MdOutlineArrowRight />
        </Button>
        <Button
          variant={`link`}
          onClick={() => {
            const ask = window.confirm(
              "Are you sure you want to exit kyc process?"
            );
            if (ask) pushUserKycState({ exit: true });
          }}
        >
          Save & Exit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationSelfiePreview;
