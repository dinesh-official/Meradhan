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
import Image from "next/image";
import React from "react";
import { MdOutlineArrowRight } from "react-icons/md";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { genMediaUrl } from "@/global/utils/url.utils";
import { dataMatcherUtils } from "@/global/utils/matcher";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";

const RenderPdf = dynamic(() => import("@/components/custom/RenderPdf"), {
  ssr: false,
});
function IdentityValidationPanInfo() {
  const { pushUserKycState } = useKycDataProvider();
  const { state, nextLocalStep } = useKycDataStorage();

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
    data.response?.details.pan.dob,
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
            <p className="font-medium">{data.response?.details.pan.dob.replaceAll("/","-")}</p>
          </DataInfoLabel>
          {data.response?.details.aadhaar.father_name && (
            <DataInfoLabel
              title="Father’s Name"
              status="SUCCESS"
              statusLabel="Fetched"
              showStatus
            >
              <p className="font-medium">
                {data.response?.details.aadhaar.father_name || "N/A"}
              </p>
            </DataInfoLabel>
          )}
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
          className="w-full sm:w-auto"
          disabled={!isAllowToContinue}
          onClick={() => {
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
        >
          Save & Exit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationPanInfo;
