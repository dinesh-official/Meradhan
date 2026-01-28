"use client";

import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { ManualKycForm } from "../../manual-kyc/_components/ManualKycForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import apiGateway, { CustomerByIdPayload } from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Spinner } from "@/components/ui/spinner";
import { ManualKycFormData } from "../../manual-kyc/_types/manualKycForm.types";
import { encodeId } from "@/global/utils/url.utils";
import { useKycDataStorage } from "./store/useKycDataStorage";
import { mapFormDataToKycStorage, mapKycStorageToFormData } from "./store/kycStoreFormMappers";
import { useEffect, useMemo } from "react";

interface ManualKycPageViewProps {
  customerId: number;
}

// Helper function to map customer data to KYC form data
function mapCustomerDataToKycForm(customer: CustomerByIdPayload): Partial<ManualKycFormData> {
  return {
    step1: {
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      gender: customer.gender || "",
      emailAddress: customer.emailAddress || "",
      username: customer.userName || "",
    },
    step2: {
      dateOfBirth: customer.personalInformation?.dateOfBirth || "",
      fatherOrSpouseName: customer.personalInformation?.fatherOrSpouseName || "",
      mothersName: customer.personalInformation?.mothersName || "",
      maritalStatus: customer.personalInformation?.maritalStatus || "",
      nationality: customer.personalInformation?.nationality || "",
      residentialStatus: customer.personalInformation?.residentialStatus || "",
      occupationType: customer.personalInformation?.occupationType || "",
      annualGrossIncome: customer.personalInformation?.annualGrossIncome || "",
      politicallyExposedPerson: customer.personalInformation?.politicallyExposedPerson === "YES" ? "yes" : "no",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      confirmPersonalInfoTimestamp: (customer.personalInformation as any)?.confirmTimeStamp
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? new Date((customer.personalInformation as any).confirmTimeStamp).toISOString()
        : new Date().toISOString(),
    },
    step3: {
      currentAddress: customer.currentAddress
        ? {
          addressLine1: customer.currentAddress.line1 || "",
          postOffice: customer.currentAddress.postOffice ?? "",
          cityOrDistrict: customer.currentAddress.cityOrDistrict || "",
          state: customer.currentAddress.state || "",
          pinCode: customer.currentAddress.pinCode || "",
          country: customer.currentAddress.country || "India",
          fullAddress: customer.currentAddress.fullAddress || "",
        }
        : {
          addressLine1: "",
          postOffice: "",
          cityOrDistrict: "",
          state: "",
          pinCode: "",
          country: "India",
          fullAddress: "",
        },
      permanentAddress: {
        sameAsCurrent: customer.permanentAddress === null ||
          (customer.currentAddress && customer.permanentAddress &&
            customer.currentAddress.line1 === customer.permanentAddress.line1)
          ? "yes"
          : "no",
        addressLine1: customer.permanentAddress?.line1 || "",
        postOffice: customer.permanentAddress?.postOffice ?? "",
        cityOrDistrict: customer.permanentAddress?.cityOrDistrict || "",
        state: customer.permanentAddress?.state || "",
        pinCode: customer.permanentAddress?.pinCode || "",
        country: customer.permanentAddress?.country || "India",
        fullAddress: customer.permanentAddress?.fullAddress || "",
      },
    },
    step4: customer.aadhaarCard
      ? {
        aadhaarNumber: customer.aadhaarCard.aadhaarNo || "",
        firstName: customer.aadhaarCard.firstName || "",
        lastName: customer.aadhaarCard.lastName || "",
        dateOfBirth: customer.aadhaarCard.dateOfBirth || "",
        gender: customer.aadhaarCard.gender || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        documentFileUrl: (customer.aadhaarCard as any).fileUrl || customer.aadhaarCard.image || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        aadhaarConsent: (customer.aadhaarCard as any).allowTerms || false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        confirmAadhaarTimestamp: (customer.aadhaarCard as any).confirmTimeStamp
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? new Date((customer.aadhaarCard as any).confirmTimeStamp).toISOString()
          : new Date().toISOString(),
      }
      : undefined,
    step5: customer.panCard
      ? {
        panNumber: customer.panCard.panCardNo || "",
        firstName: customer.panCard.firstName || "",
        lastName: customer.panCard.lastName || "",
        dateOfBirth: customer.panCard.dateOfBirth || "",
        gender: customer.panCard.gender || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        documentFileUrl: (customer.panCard as any).fileUrl || (customer.panCard as any).image || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        panConsent: (customer.panCard as any).allowTerms || false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        confirmPanTimestamp: (customer.panCard as any).confirmTimeStamp
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? new Date((customer.panCard as any).confirmTimeStamp).toISOString()
          : new Date().toISOString(),
      }
      : undefined,
    step6: {
      bankAccounts: customer.bankAccounts && customer.bankAccounts.length > 0
        ? customer.bankAccounts.map((acc) => ({
          accountHolderName: acc.accountHolderName || "",
          bankName: acc.bankName || "",
          accountNumber: acc.accountNumber || "",
          ifscCode: acc.ifscCode || "",
          accountType: acc.bankAccountType || "",
          isPrimary: acc.isPrimary || false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          bankAccountConsent: (acc as any).allowTerms || false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          confirmBankTimestamp: (acc as any).confirmTimeStamp
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? new Date((acc as any).confirmTimeStamp).toISOString()
            : new Date().toISOString(),
        }))
        : [
          {
            accountHolderName: "",
            bankName: "",
            accountNumber: "",
            ifscCode: "",
            accountType: "",
            isPrimary: true,
            bankAccountConsent: false,
            confirmBankTimestamp: "",
          },
        ],
    },
    step7: {
      riskQuestionnaireResponses: customer.riskProfile?.data
        ? customer.riskProfile.data.map((item) => ({
          qus: item.qus,
          ans: item.ans || "",
          index: item.index,
          opt: item.opt,
        }))
        : [
          {
            qus: "How many years of investment experience do you have?",
            ans: "",
            index: 0,
            opt: ["None", "Up to 1 year", "1 – 5 years", "More than 5 years"],
          },
          {
            qus: "What is your investment goal?",
            ans: "",
            index: 1,
            opt: [
              "Steady Income",
              "Capital Gains",
              "Short-term Parking",
              "Risk Diversification",
            ],
          },
          {
            qus: "What is your risk appetite?",
            ans: "",
            index: 2,
            opt: [
              "Low Risk & Low Returns",
              "Moderate Risk & Moderate Returns",
              "High Risk & High Returns",
            ],
          },
          {
            qus: "What is your investment time horizon?",
            ans: "",
            index: 3,
            opt: ["Up to 1 year", "1 – 3 years", "3 – 5 years", "More than 5 years"],
          },
        ],
    },
    step8: {
      fatcaDeclaration: "no", // This might need to be derived from customer data
      pepDeclaration: customer.personalInformation?.politicallyExposedPerson === "YES" ? "yes" : "no",
      sebiTermsAcceptance: false, // This might need to be derived from customer data
    },
    step10: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eSignDocument: (customer as any)?.eSignDocument || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attachments: (customer as any)?.attachments || [],
    },
  };
}

export default function ManualKycPageView({ customerId }: ManualKycPageViewProps) {
  const router = useRouter();
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const { state: storeState, setState: setStoreState } = useKycDataStorage();

  const { data: customerData, isLoading } = useQuery({
    queryKey: ["customerForManualKyc", customerId],
    queryFn: async () => {
      const { data } = await customerApi.customerInfoById(customerId);
      return data.responseData;
    },
  });

  // Hydrate store from customer when data loads (run once per customer)
  useEffect(() => {
    if (!customerData) return;
    const formFromCustomer = mapCustomerDataToKycForm(customerData);
    console.log("formFromCustomer", formFromCustomer);
    const current = useKycDataStorage.getState().state;
    setStoreState(mapFormDataToKycStorage(formFromCustomer, current));
  }, [customerData, setStoreState]);

  // Initial form data: from store merged with customer; step1 auto-filled from customer (firstName, lastName, email, username)
  const initialFormData = useMemo((): Partial<ManualKycFormData> => {
    if (!customerData) return {};
    const fromStore = mapKycStorageToFormData(storeState);
    const fromCustomer = mapCustomerDataToKycForm(customerData);
    return {
      ...fromCustomer,
      ...fromStore,
      step1: {
        ...fromStore.step1,
        ...fromCustomer.step1,
        firstName: fromCustomer.step1?.firstName ?? fromStore.step1?.firstName ?? "",
        lastName: fromCustomer.step1?.lastName ?? fromStore.step1?.lastName ?? "",
        emailAddress: fromCustomer.step1?.emailAddress ?? fromStore.step1?.emailAddress ?? "",
        username: fromCustomer.step1?.username ?? fromStore.step1?.username ?? "",
        gender: fromCustomer.step1?.gender ?? fromStore.step1?.gender ?? "",
      },
      step3: fromCustomer.step3,
      step9: fromCustomer.step9,
      step10: fromCustomer.step10,
    };
  }, [customerData, storeState]);

  const handleFormDataChange = (formData: ManualKycFormData) => {
    const current = useKycDataStorage.getState().state;
    setStoreState(mapFormDataToKycStorage(formData, current));
  };

  const handleSuccess = () => {
    toast.success("KYC data submitted successfully");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(`/dashboard/customers/view/${encodeId(customerId)}` as any);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Customer not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageInfoBar
        title={`Manual KYC Entry - ${customerData.firstName} ${customerData.lastName}`}
        description="Enter or update mandatory KYC information for regulatory compliance. All fields are required."
        showBack
      />

      <div className="max-w-4xl mx-auto">
        <ManualKycForm
          customerId={customerId}
          initialData={initialFormData}
          onSuccess={handleSuccess}
          onFormDataChange={handleFormDataChange}
        />
      </div>
      <div className="flex justify-center items-center h-96">
        {JSON.stringify(storeState)}
      </div>
    </div>
  );
}

