"use client";
import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dataMatcherUtils } from "@/global/utils/matcher";
import { genMediaUrl } from "@/global/utils/url.utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { addActivityLog } from "@/analytics/UserTrackingProvider";

const RenderPdf = dynamic(() => import("@/components/custom/RenderPdf"), {
  ssr: false,
});
function IdentityValidationPanInfo() {
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { state, nextLocalStep, setStep1PanData } = useKycDataStorage();

  const data = state.step_1.pan;
  const genders = {
    M: "Male",
    F: "Female",
  };

  const isPanMatched = dataMatcherUtils.areValuesMatched(
    data.response?.details.pan.name,
    data.response?.details.aadhaar.name
  );

  const isNameMatched = dataMatcherUtils.areNamesMatched(
    dataMatcherUtils.splitFullName(data.response?.details.pan.name),
    {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
    }
  );

  const isDobMatched = dataMatcherUtils.areDatesMatched(
    data.response?.details.pan.dob
      .replaceAll("/", "-")
      .split("-")
      .reverse()
      .join("-"),
    data.dateOfBirth
  );

  const isAllowToContinue = isPanMatched && isNameMatched && isDobMatched;

  return (
    <Card accountMode>
      {/* {JSON.stringify(data)} */}
      <CardHeader accountMode>
        <CardTitle className="font-normal">Confirm PAN Details</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="gap-5 grid md:grid-cols-2 lg:grid-cols-3">
          <DataInfoLabel
            title="PAN Number"
            status={isPanMatched ? "SUCCESS" : "ERROR"}
            statusLabel={isPanMatched ? "Verified" : "Invalid"}
            showStatus
          >
            <p className="font-medium">
              {data.response?.details.pan.id_number}
            </p>
          </DataInfoLabel>
          <DataInfoLabel
            title="Name as per PAN"
            status={isNameMatched ? "SUCCESS" : "ERROR"}
            statusLabel={isNameMatched ? "Matched" : "Not Matched"}
            showStatus
          >
            <p className="font-medium">{data.response?.details.pan.name}</p>
          </DataInfoLabel>
          <DataInfoLabel
            title="Date of Birth"
            status={isDobMatched ? "SUCCESS" : "ERROR"}
            statusLabel={isDobMatched ? "Verified" : "Invalid"}
            showStatus
          >
            <p className="font-medium">
              {data.response?.details.pan.dob.replaceAll("/", "-")}
            </p>
          </DataInfoLabel>

          <DataInfoLabel
            title="Gender"
            status="SUCCESS"
            statusLabel="Fetched"
            showStatus
          >
            <p className="font-medium">
              {genders[data.response?.details.pan.gender as "M" | "F"] ||
                "Others"}
            </p>
          </DataInfoLabel>

          <div className="gap-5 grid lg:grid-cols-3 md:col-span-2 lg:col-span-3">
            <Image
              src={genMediaUrl(data.response?.details.aadhaar.image)}
              alt="PAN Card"
              width={840}
              height={397}
              className="bg-gray-50 rounded-2xl w-48 object-cover aspect-3/4"
            />
            <div className="md:col-span-2">
              <RenderPdf
                file={genMediaUrl(data.response?.details.pan.file_url)}
                height={280}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5 mt-5">
        <Button
          className="flex items-center gap-1 w-full sm:w-auto"
          disabled={!isAllowToContinue}
          onClick={() => {
            addAuditLog({
              type: "KYC_PROCESS_CONTINUED",
              desc: "User chose to continue the KYC process : PAN and Identity Validation step.",
            });
            setStep1PanData("confirmPanTimestamp", new Date().toISOString());
            addActivityLog({
              action: "CONFIRMED_PAN_DETAILS",
              details: {
                step: "PAN and Identity Validation step - Confirmed PAN Details",
                PanNo: state.step_1.pan.panCardNo,
                DateOfBirth: state.step_1.pan.dateOfBirth,
                FirstName: state.step_1.pan.firstName,
                MiddleName: state.step_1.pan.middleName,
                LastName: state.step_1.pan.lastName,
                Gender:
                  genders[data.response?.details.pan.gender as "M" | "F"] ||
                  "Others",
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
                desc: "User chose to save and exit the KYC process : PAN and Identity Validation step.",
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

export default IdentityValidationPanInfo;
