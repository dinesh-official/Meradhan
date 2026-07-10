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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoMdArrowDropright } from "react-icons/io";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import {
  incomeRangeOptions,
  maritalStatusOptions,
  nationalityOptions,
  occupationOptions,
  qualificationOptions,
  relationshipOptions,
  residentialStatusOptions,
} from "./data";
import { usePersonalDetailsFormHook } from "./usePersonalDetailsFormHook";

function PersonalDetailsForm() {
  const { setStep2PersonalData, state } = useKycDataStorage();

  const { handelPersonalSubmit, error, removeError } =
    usePersonalDetailsFormHook();

  const data = state.step_2;
  const isFromKra = state.step_1.usedExistingKra;

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Personal Details</CardTitle>
      </CardHeader>

      <CardContent accountMode>
        <div className="gap-3 md:gap-5 grid sm:grid-cols-2 lg:grid-cols-3">
          {/* Marital Status – disabled when pre-filled from KRA */}
          <LabelInput
            label="Marital Status"
            required
            error={error?.maritalStatus?.[0]}
          >
            <Select
              onValueChange={(e) => {
                setStep2PersonalData("maritalStatus", e);
                removeError("maritalStatus");
              }}
              value={data.maritalStatus}
            >
              <SelectTrigger className="w-full" disabled={isFromKra}>
                <SelectValue placeholder="Select Marital Status" />
              </SelectTrigger>
              <SelectContent>
                {maritalStatusOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabelInput>

          {/* Father/Spouse Name – disabled when pre-filled from KRA */}
          <LabelInput
            label="Father’s / Spouse Name"
            required
            error={error?.fatSpuName?.[0]}
          >
            <Input
              type="text"
              value={data.fatSpuName}
              onChange={(e) => {
                setStep2PersonalData("fatSpuName", e.target.value);
                removeError("fatSpuName");
              }}
              disabled={isFromKra}
            />
          </LabelInput>

          {/* Relationship */}
          <LabelInput
            label="Relationship with this Person"
            required
            error={error?.reelWithPerson?.[0]}
          >
            <Select
              onValueChange={(e) => {
                setStep2PersonalData("reelWithPerson", e);
                removeError("reelWithPerson");
              }}
              value={data.reelWithPerson}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabelInput>

          {/* Qualification */}
          <LabelInput
            label="Qualification"
            required
            error={error?.qualification?.[0]}
          >
            <Select
              onValueChange={(e) => {
                setStep2PersonalData("qualification", e);
                removeError("qualification");
              }}
              value={data.qualification}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Qualification" />
              </SelectTrigger>
              <SelectContent>
                {qualificationOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabelInput>


          {/* Occupation – always editable (KRA users may change selection) */}
          <LabelInput
            label="Occupation Type"
            required
            error={error?.occupationType?.[0]}
          >
            <Select
              onValueChange={(e) => {
                setStep2PersonalData("occupationType", e);
                removeError("occupationType");
              }}
              value={data.occupationType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Occupation" />
              </SelectTrigger>
              <SelectContent>
                {occupationOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabelInput>

          {
            data.occupationType === "Others" && (
              <LabelInput
                label="Other Occupation Name"
                required
                error={error?.otherOccupationName?.[0]}
              >
                <Input
                  type="text"
                  value={data.otherOccupationName}
                  maxLength={30}
                  onChange={(e) => {
                    setStep2PersonalData("otherOccupationName", e.target.value);
                    removeError("otherOccupationName");
                  }}
                />
              </LabelInput>
            )
          }
          {/* Income range – always editable (KRA users may change selection) */}
          <LabelInput
            label="Income Range"
            required
            error={error?.annualGrossIncome?.[0]}
          >
            <Select
              onValueChange={(e) => {
                setStep2PersonalData("annualGrossIncome", e);
                removeError("annualGrossIncome");
              }}
              value={data.annualGrossIncome}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Income Range" />
              </SelectTrigger>
              <SelectContent>
                {incomeRangeOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabelInput>

          {/* Mother’s Name */}
          <LabelInput
            label="Mother’s Name"
            required
            error={error?.motherName?.[0]}
          >
            <Input
              type="text"
              value={data.motherName}
              onChange={(e) => {
                setStep2PersonalData("motherName", e.target.value);
                removeError("motherName");
              }}
            />
          </LabelInput>

          {/* Nationality – disabled when pre-filled from KRA */}
          <LabelInput
            label="Nationality"
            required
            error={error?.nationality?.[0]}
          >
            <Select
              onValueChange={(e) => {
                setStep2PersonalData("nationality", e);
                removeError("nationality");
              }}
              value={data.nationality}
            >
              <SelectTrigger className="w-full" disabled={isFromKra}>
                <SelectValue placeholder="Select Nationality" />
              </SelectTrigger>
              <SelectContent>
                {nationalityOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabelInput>

          {/* Residential Status */}
          <LabelInput
            label="Residential Status"
            required
            error={error?.residentialStatus?.[0]}
          >
            <Select
              onValueChange={(e) => {
                setStep2PersonalData("residentialStatus", e);
                removeError("residentialStatus");
              }}
              value={data.residentialStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Residential Status" />
              </SelectTrigger>
              <SelectContent>
                {residentialStatusOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabelInput>
        </div>
      </CardContent>

      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button className="flex items-center gap-1 w-full sm:w-auto" onClick={handelPersonalSubmit}>
          Save & Continue  <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PersonalDetailsForm;
