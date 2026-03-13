"use client";
import LabelInput from "@/app/(account)/_components/wrapper/LableInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { userSessionStore } from "@/core/auth/userSessionStore";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useDigioSDK } from "../../../_providers/useDigioSDK";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Mask Aadhaar for display: XXXX XXXX last4 */
function maskAadhaar(aadhaarNo: string): string {
  const digits = aadhaarNo.replace(/\D/g, "");
  if (digits.length < 4) return "**** **** ****";
  const last4 = digits.slice(-4);
  return "XXXX XXXX " + last4;
}

function AdharInfoForm() {
  const digio = useDigioSDK();
  const { state, setGenderData, setStep1PanData } = useKycDataStorage();
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { nextLocalStep } = useKycDataStorage();
  const { cookies } = useAppCookie();
  const { session } = userSessionStore();

  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const profileQuery = useQuery({
    queryKey: ["getProfileDataForKyc"],
    queryFn: async () => {
      const response = await customerApi.customerInfoById(Number(cookies.userId));
      return response.data.responseData;
    },
  });
  const profile = profileQuery.data;
  const isRekyc = profile?.kycStatus === "RE_KYC";
  const existingAadhaar = profile?.aadhaarCard?.aadhaarNo ?? "";
  const displayAadhaar = existingAadhaar ? maskAadhaar(existingAadhaar) : "";

  const apiClient = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller,
  );

  const verifyAadhaarResponseMutation = useMutation({
    mutationKey: ["verifyAadhaarResponse"],
    mutationFn: async (kid: string) => {
      const response = await apiClient.verifyPanVerification({ kid });
      return response;
    },
    onSuccess: (data) => {
      setStep1PanData("response", {
        ...state.step_1.pan.response,
        details: {
          ...state.step_1.pan.response?.details,
          aadhaar: data.responseData.details.aadhaar,
        },
      });

      setStep1PanData(
        "fetchedTimestamp",
        new Date(data?.responseData?.completed_at).toISOString(),
      );

      pushUserKycState();
      nextLocalStep();
      console.log("Aadhaar verification response successful:", data);
    },
    onError: (error) => {
      console.error("Error during Aadhaar verification response:", error);
    },
  });

  const requestAadharVerificationMutation = useMutation({
    mutationKey: ["requestAadharVerification"],
    mutationFn: async () => {
      const response = await apiClient.requestAadharVerification({
        // aadhaarCardNo: state.step_1.aadhar,
        gender: state.step_1.gender,
        dateOfBirth: state.step_1.pan.dateOfBirth,
        firstName: state.step_1.pan.firstName,
        lastName: state.step_1.pan.lastName,
        middleName: state.step_1.pan.middleName || "",
        email: session?.emailAddress || "",
      });
      return response;
    },
    onSuccess: (data) => {
      const kycInstance = digio.createInstance({
        callback(response) {
          if (response.error_code) {
            toast.error(response.message || "Something went wrong");
          } else if (response.digio_doc_id) {
            // TODO: verify aadhaar response
            console.log(response);
            verifyAadhaarResponseMutation.mutate(response.digio_doc_id);
          } else {
            toast.error(response.message || "Something went wrong");
          }
        },
      });
      kycInstance.init();
      kycInstance.submit(
        data.responseData.access_token.entity_id,
        data.responseData.customer_identifier,
        data.responseData.access_token.id,
      );
    },
    onError: (error) => {
      console.error("Error during Aadhaar verification request:", error);
    },
  });

  const handleAadhaarVerify = () => {
    if (state.step_1.gender.length === 0) {
      toast.error("Please select your gender");
      return;
    }
    requestAadharVerificationMutation.mutate();
  };

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Let’s Verify Your Aadhaar</CardTitle>
      </CardHeader>

      <CardContent accountMode>
        {/* {isRekyc && existingAadhaar ? (
          <LabelInput label="Aadhaar Number" required>
            <Input
              type="text"
              value={displayAadhaar}
              readOnly
              disabled
              className="bg-muted cursor-not-allowed max-w-xs"
            />
            <p className="text-muted-foreground text-xs mt-1">
              Re-KYC: Using your previously verified Aadhaar. Verify via
              DigiLocker below to continue.
            </p>
          </LabelInput>
        ) : null} */}
        <LabelInput label="Confirm Your Gender" required>
          <Select
            onValueChange={(e) => {
              setGenderData(e.toString());
            }}
            value={state.step_1?.gender || ""}
          >
            <SelectTrigger className="w-full max-w-80">
              <SelectValue placeholder="Select Your Gender" />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
              ].map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </LabelInput>
      </CardContent>

      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          className="flex items-center gap-1 w-full sm:w-auto"
          onClick={handleAadhaarVerify}
          disabled={
            requestAadharVerificationMutation.isPending ||
            verifyAadhaarResponseMutation.isPending
          }
        >
          Verify Aadhaar
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>

        <Button
          variant="link"
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
                desc: "User chose to save and exit the KYC process : Aadhar and Identity Validation step.",
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

export default AdharInfoForm;
