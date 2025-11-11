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
import { MdOutlineArrowRight } from "react-icons/md";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import dynamic from "next/dynamic";
import { genMediaUrl } from "@/global/utils/url.utils";
import Swal from "sweetalert2";
const RenderPdf = dynamic(() => import("@/components/custom/RenderPdf"), {
  ssr: false,
});
function IdentityValidationAadharInfo() {
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
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
          Confirm Aadhar & Address Details
        </CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="gap-10 grid lg:grid-cols-5">
          <div className="flex flex-col gap-5 col-span-2">
            <DataInfoLabel
              title="Aadhar Number (last 4-digits)"
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
          <div className="col-span-3">
            <RenderPdf
              file={genMediaUrl(data.response?.details.aadhaar.file_url || "")}
              height={320}
            />
          </div>
        </div>
        <div className="gap-5 grid md:grid-cols-3 md:mt-10 py-5 border-gray-200 md:border-t md:border-b">
          <DataInfoLabel title="City">
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
          className="w-full sm:w-auto"
          disabled={!isNameMatched}
          onClick={() => {
            setStep1PanData(
              "confirmAadhaarTimestamp",
              new Date().toISOString()
            );
            addAuditLog({
              type: "KYC_PROCESS_CONTINUED",
              desc: "User chose to continue the KYC process : Aadhar and Address Validation step.",
            });
            nextLocalStep();
            pushUserKycState();
          }}
        >
          Continue to Verify <MdOutlineArrowRight />
        </Button>
        <Button
          variant={`link`}
          onClick={async () => {
            const result = await Swal.fire({
              text: "Are you sure you want to save and exit the KYC process?",
              imageUrl: "/images/icons/sad-emoji.svg",
              showCancelButton: true,
              confirmButtonText: "Yes, Exit",
              cancelButtonText: "Cancel",
            });

            if (result.isConfirmed) {
              addAuditLog({
                type: "KYC_PROCESS_EXITED",
                desc: "User chose to save and exit the KYC process : Aadhar and Address Validation step.",
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
