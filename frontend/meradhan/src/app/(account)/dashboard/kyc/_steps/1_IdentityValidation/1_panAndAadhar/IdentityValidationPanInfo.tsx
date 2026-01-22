"use client";
import { addActivityLog } from "@/analytics/UserTrackingProvider";
import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { IoReload } from "react-icons/io5";
import { useEffect } from "react";
import { dateTimeUtils } from "@/global/utils/datetime.utils";

function IdentityValidationPanInfo() {
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { state, nextLocalStep, setStep1PanData, prevLocalStep, resetPanRetryCount } = useKycDataStorage();

  const data = state.step_1.pan;

  const isNameMatched = data.response?.details?.panInfo?.name_as_per_pan_match;
  const isDobMatched = data.response?.details?.panInfo?.date_of_birth_match;

  const isPanMatched = isNameMatched && isDobMatched;
  const isAllowToContinue = isPanMatched;

  useEffect(() => {
    if (data?.panRetryCount && data?.panRetryCount >= 3) {

      const nextAllowedExpiresAt = localStorage.getItem("TAYDF");

      if (nextAllowedExpiresAt) {
        // check if the next allowed expires at is in the past
        if (dateTimeUtils.isPast(new Date(nextAllowedExpiresAt))) {
          resetPanRetryCount();
          pushUserKycState();
          localStorage.removeItem("TAYDF");
        }
      } else {
        // 1 hour from now
        const nextAllowed = new Date(Date.now() + 1 * 60 * 60 * 1000);
        localStorage.setItem("TAYDF", nextAllowed.toISOString());
      }
    }
  }, []);

  return (
    <Card accountMode>
      {/* {JSON.stringify(data)} */}
      <CardHeader accountMode>
        <CardTitle className="font-normal">
          Confirm PAN Details
        </CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="gap-5 grid md:grid-cols-2 lg:grid-cols-3">
          <DataInfoLabel
            title="PAN Number"
            status={isPanMatched ? "SUCCESS" : "ERROR"}
            statusLabel={isPanMatched ? "Verified" : "Not Verified"}
            showStatus
          >
            <p className="font-medium flex items-center gap-2 flex-row">
              {data.response?.details.pan.id_number}{((data?.panRetryCount || 0) < 3) && !isAllowToContinue && <span className="text-xs text-primary flex items-center gap-2 flex-row cursor-pointer" onClick={() => {
                prevLocalStep();
                setTimeout(() => {
                  pushUserKycState();
                }, 1000);
              }} >Retry <IoReload className="w-3 h-3" size={10} /></span>}
            </p>
          </DataInfoLabel>
          <DataInfoLabel
            title="Name as per PAN"
            status={isNameMatched ? "SUCCESS" : "ERROR"}
            statusLabel={isNameMatched ? "Matched" : "Not Matched with PAN"}
            showStatus
          >
            <p className="font-medium">{data.response?.details.pan.name}</p>
          </DataInfoLabel>
          <DataInfoLabel
            title="Date of Birth"
            status={
              isDobMatched
                ? "SUCCESS"
                : "ERROR"
            }
            statusLabel={
              isDobMatched
                ? "Matched"
                : "Not Matched with PAN"
            }
            showStatus
          >
            <p className="font-medium">
              {data.response?.details.pan.dob.replaceAll("/", "-")}
            </p>
          </DataInfoLabel>

          {/* <DataInfoLabel
            title="Gender"
            status="SUCCESS"
            statusLabel="Fetched"
            showStatus
          >
            <p className="font-medium">
              {genders[data.response?.details.aadhaar.gender as "M" | "F"] ||
                "Others"}
            </p>
          </DataInfoLabel> */}

          {/* <div className="gap-5 grid lg:grid-cols-3 md:col-span-2 lg:col-span-3">
            <div className="md:col-span-3">
              <RenderPdf
                file={genMediaUrl(data.response?.details.pan.file_url)}
                height={280}
              />
            </div>
          </div> */}
        </div>

        {(((data?.panRetryCount || 0) >= 3) && !isAllowToContinue) && <div className="flex flex-col gap-2 p-4 bg-yellow-50 border mt-5 border-yellow-200 rounded-lg mb-4">
          <p className="text-yellow-900 text-sm font-medium">
            You’ve reached the maximum number of PAN verification attempts. Please try again after 1 hour or contact us if you need assistance
          </p>
        </div>}

      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5 mt-5">
        {isAllowToContinue && <Button
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
        </Button>}
        <Button
          variant={isAllowToContinue ? `link` : `outline`}
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
