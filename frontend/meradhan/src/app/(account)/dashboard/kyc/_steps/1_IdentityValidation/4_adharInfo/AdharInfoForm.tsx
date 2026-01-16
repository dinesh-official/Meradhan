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
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { IoMdArrowDropright } from "react-icons/io";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";

function AdharInfoForm() {
  const { state, setAadharData } = useKycDataStorage();

  const apiClient = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller
  );

  const handleAadhaarVerify = async () => {
    try {
      const response = await apiClient.requestAadharVerification({
        aadhaarCardNo: state.step_1.aadhar,
        dateOfBirth: state.step_1.pan.dateOfBirth,
        firstName: state.step_1.pan.firstName,
        lastName: state.step_1.pan.lastName,
        middleName: state.step_1.pan.middleName || "",
      });
      console.log("Aadhaar verification request successful:", response);
    } catch (error) {
      console.error("Error during Aadhaar verification request:", error);
    }
  };

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Let’s Verify Your Aadhaar</CardTitle>
      </CardHeader>

      <CardContent accountMode>
        <LabelInput label="12-Digit Aadhaar Number" required>
          <Input
            type="text"
            className="max-w-96 mt-2"
            value={state.step_1.aadhar}
            onChange={(e) => setAadharData(e.target.value)}
          />
        </LabelInput>
      </CardContent>

      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          className="flex items-center gap-1 w-full sm:w-auto"
          onClick={handleAadhaarVerify}
        >
          Verify Aadhaar
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>

        <Button variant="link" onClick={async () => {}}>
          Save & Exit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AdharInfoForm;
