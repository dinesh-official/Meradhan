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
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { addActivityLog } from "@/analytics/UserTrackingProvider";
import Image from "next/image";
const RenderPdf = dynamic(() => import("@/components/custom/RenderPdf"), {
  ssr: false,
});
function IdentityValidationAadharInfo() {
  const { pushUserKycState, addAuditLog, pushAuditLog } = useKycDataProvider();
  const { state, nextLocalStep, setStep1PanData } = useKycDataStorage();

  const data = state.step_1.pan;

  const isNameMatched = dataMatcherUtils.areNamesMatched(
    dataMatcherUtils.splitFullName(data.response?.details.pan.name),
    {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
    }
  );

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">
          Confirm Aadhaar & Address Details
        </CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="gap-10 grid ">
          <div className="flex flex-col gap-5 ">
            <DataInfoLabel
              title="Aadhaar Number (last 4-digits)"
              status="SUCCESS"
              statusLabel="Fetched"
              showStatus
            >
              <p className="font-medium">
                {data.response?.details.aadhaar.id_number}
              </p>
            </DataInfoLabel>
            <DataInfoLabel
              title="Name"
              status={isNameMatched ? "SUCCESS" : "ERROR"}
              statusLabel={isNameMatched ? "Matched" : "Not Matched"}
              showStatus
            >
              <p className="font-medium">
                {data.response?.details.aadhaar.name}
              </p>
            </DataInfoLabel>
            <DataInfoLabel
              title="Address"
              status="SUCCESS"
              statusLabel="Fetched"
              showStatus
              subtext={
                <>
                  <p className="text-gray-500 text-xs">
                    (will be used for future communications)
                  </p>
                </>
              }
            >
              <p className="font-medium text-wrap">
                {data.response?.details.aadhaar.current_address.replaceAll(
                  ",",
                  ", "
                )}
              </p>
            </DataInfoLabel>
          </div>
          <div className="md:col-span-3 grid md:grid-cols-4 gap-5">
            <div className="flex justify-center items-center">
              <Image
                src={genMediaUrl(data.response?.details.aadhaar.image)}
                alt="PAN Card"
                width={840}
                height={397}
                className="bg-gray-50 rounded-2xl w-48 object-cover aspect-3/4"
              />
            </div>
            <div className="col-span-3">
              <RenderPdf
                file={genMediaUrl(
                  data.response?.details.aadhaar.file_url || ""
                )}
                height={320}
              />
            </div>
          </div>
        </div>
        <div className="gap-5 grid md:grid-cols-3 md:mt-10 py-5 border-gray-200 md:border-t md:border-b">
          <DataInfoLabel title="City or District">
            <p className="font-medium">
              {
                data.response?.details.aadhaar.current_address_details
                  .district_or_city
              }
            </p>
          </DataInfoLabel>
          <DataInfoLabel title="State">
            <p className="font-medium">
              {data.response?.details.aadhaar.current_address_details.state}
            </p>
          </DataInfoLabel>
          <DataInfoLabel title="Pincode">
            <p className="font-medium">
              {data.response?.details.aadhaar.current_address_details.pincode}
            </p>
          </DataInfoLabel>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          className="flex items-center gap-1 w-full sm:w-auto"
          disabled={!isNameMatched}
          onClick={() => {
            setStep1PanData(
              "confirmAadhaarTimestamp",
              new Date().toISOString()
            );
            addAuditLog({
              type: "KYC_PROCESS_CONTINUED",
              desc: "User chose to continue the KYC process : Aadhaar and Address Validation step.",
            });
            addActivityLog({
              action: "CONFIRMED_AADHAAR_DETAILS",
              details: {
                step: "PAN and Identity Validation step - Confirmed Aadhaar Details",
                AadhaarNo: data.response?.details.aadhaar.id_number,
                DateOfBirth: data.response?.details.aadhaar.dob,
                Name: data.response?.details.aadhaar.name,
                Address: data.response?.details.aadhaar.current_address,
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
                desc: "User chose to save and exit the KYC process : Aadhaar and Address Validation step.",
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

export default IdentityValidationAadharInfo;
