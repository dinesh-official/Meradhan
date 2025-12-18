"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormCheckbox } from "@/global/elements/inputs/FormCheckbox";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { CreateNegotiationResponse } from "@root/apiGateway";
import { useState } from "react";

const DealSplitForm = ({
  data,
  onSubmitForm,
  loading,
}: {
  data: CreateNegotiationResponse;
  loading?: boolean;
  onSubmitForm: (data: {
    calcMethod: string | undefined;
    dealType: string | undefined;
    clientCode: string | undefined;
    price: number | undefined;
    accruedInterest: number | undefined;
    consideration: number | undefined;
    putCallDate: string | undefined;
    institutionalInvestor: boolean;
    remarks: string | undefined;
  }) => void;
}) => {
  const [calcMethod, setCalcMethod] = useState<string | undefined>("O");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [dealType, setDealType] = useState<string | undefined>(undefined);
  const [clientCode, setClientCode] = useState<string | undefined>(
    data.initClientCode
  );
  const [accruedInterest, setAccruedInterest] = useState<number | undefined>(
    undefined
  );
  const [consideration, setConsideration] = useState<number | undefined>(
    undefined
  );
  const [putCallDate, setPutCallDate] = useState<string | undefined>(undefined);
  const [institutionalInvestor, setInstitutionalInvestor] =
    useState<boolean>(false);
  const [remarks, setRemarks] = useState<string | undefined>(undefined);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateField = (field: string, value: any) => {
    let message = "";

    if (
      [
        "dealType",
        "clientCode",
        "price",
        "accruedInterest",
        "calcMethod",
        "consideration",
      ].includes(field)
    ) {
      if (!value || value === "" || value === undefined || value === null) {
        message = "This field is required.";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));

    return message === "";
  };

  const handleSubmit = () => {
    const validations = [
      validateField("calcMethod", calcMethod),
      validateField("dealType", dealType),
      validateField("clientCode", clientCode),
      validateField("price", price),
      validateField("accruedInterest", accruedInterest),
      validateField("consideration", consideration),
    ];

    const allValid = validations.every(Boolean);

    if (allValid) {
      const data = {
        calcMethod,
        dealType,
        clientCode,
        price,
        accruedInterest,
        consideration,
        putCallDate,
        institutionalInvestor,
        remarks,
      };
      onSubmitForm(data);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        {/* Calculation Method */}
        <div className="flex flex-col">
          <SelectField
            label="Calculation Method *"
            placeholder="Calculation Method"
            value={calcMethod}
            onChangeAction={(e) => {
              setCalcMethod(e as string);
              validateField("calcMethod", e);
            }}
            options={[
              { label: "Money Market", value: "M" },
              { label: "Other", value: "O" },
            ]}
          />
          {errors.calcMethod && (
            <p className="mt-1 text-red-500 text-sm">{errors.calcMethod}</p>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <InputField
            id="price"
            label="Price *"
            placeholder="Enter Price"
            type="number"
            max={100}
            value={price?.toString()}
            onChangeAction={(e) => {
              setPrice(Number(e));
              validateField("price", e);
              if (accruedInterest) {
                const faceValue = Number(data.initValue) * 10000000;
                //  ((facevalue * price) / 100) + accured interest
                const updatedPrice = (faceValue * Number(e)) / 100 + Number(e);
                setConsideration(updatedPrice);
              }
            }}
          />
          {errors.price && (
            <p className="mt-1 text-red-500 text-sm">{errors.price}</p>
          )}
        </div>

        {/* Total Accrued Interest */}
        <div className="flex flex-col">
          <InputField
            id="totalAccruedInterest"
            label="Total Accrued Interest *"
            placeholder="Enter Total Accrued Interest"
            type="number"
            value={accruedInterest?.toString()}
            onChangeAction={(e) => {
              setAccruedInterest(Number(e));
              validateField("accruedInterest", e);
              if (price) {
                const faceValue = Number(data.initValue) * 10000000;
                //  ((facevalue * price) / 100) + accured interest
                const updatedPrice = (faceValue * price) / 100 + Number(e);
                setConsideration(updatedPrice);
              }
            }}
          />
          {errors.accruedInterest && (
            <p className="mt-1 text-red-500 text-sm">
              {errors.accruedInterest}
            </p>
          )}
        </div>

        {/* Consideration */}
        <div className="flex flex-col">
          <InputField
            id="consideration"
            label="Consideration *"
            placeholder="Enter Consideration"
            type="number"
            value={consideration?.toString()}
            onChangeAction={(e) => {
              setConsideration(Number(e));
              validateField("consideration", e);
            }}
          />
          {errors.consideration && (
            <p className="mt-1 text-red-500 text-sm">{errors.consideration}</p>
          )}
        </div>

        {/* Put Call Date */}
        <div className="flex flex-col">
          <InputField
            id="putCallOptionClientCode"
            label="Put Call Date"
            placeholder="Enter Date"
            type="date"
            value={putCallDate}
            onChangeAction={(e) => setPutCallDate(e)}
          />
        </div>

        {/* Deal Type */}
        <div className="flex flex-col">
          <SelectField
            label="Deal Type *"
            placeholder="Deal Type"
            value={dealType}
            onChangeAction={(e) => {
              setDealType(e as string);
              validateField("dealType", e);
            }}
            options={[
              { label: "Direct", value: "D" },
              { label: "Brokered", value: "B" },
            ]}
          />
          {errors.dealType && (
            <p className="mt-1 text-red-500 text-sm">{errors.dealType}</p>
          )}
        </div>

        {/* Institution Checkbox (for Brokered only) */}
        {dealType === "B" && (
          <div className="flex flex-col justify-end">
            <FormCheckbox
              checked={institutionalInvestor}
              onCheckedChange={(e) => setInstitutionalInvestor(e)}
              label="Institution"
            />
          </div>
        )}

        {/* Client Code */}
        <div className="flex flex-col">
          <InputField
            id="clientCode"
            label="Client Code *"
            placeholder="Enter Client Code"
            type="text"
            value={clientCode}
            onChangeAction={(e) => {
              setClientCode(e);
              validateField("clientCode", e);
            }}
          />
          {errors.clientCode && (
            <p className="mt-1 text-red-500 text-sm">{errors.clientCode}</p>
          )}
        </div>
      </div>

      {/* Remarks */}
      <div className="flex flex-col">
        <Textarea
          id="remarks"
          placeholder="Add any remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <Button type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default DealSplitForm;
