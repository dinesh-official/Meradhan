"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Landmark, Plus } from "lucide-react";
import AddressInformatoin from "./_components/address-information/AddressInformatoin";
import { useAddressFormDataHook } from "./_components/address-information/useBankAccountFormHook";
import BankAccountDetails from "./_components/bank-account/BankAccountDetails";
import { useBankAccountFormHook } from "./_components/bank-account/useBankAccountFormHook";
import BasicDetailsForm from "./_components/basic-details/BasicDetailsForm";
import { useBasicFormDataHook } from "./_components/basic-details/useBasicDetailFormHook";
import DPAccountDetails from "./_components/dpAccount/DpAccountDetails";
import { useDPAccountFormHook } from "./_components/dpAccount/useDpAccountFormHook";
import LEIInformation from "./_components/lei-Information/LeiInformation";
import { useLEIInformationFormHook } from "./_components/lei-Information/useLeiInformationFormHook";

//remove icons from all

const CreateNSCParticipant = () => {
  const bankAccountFormHook = useBankAccountFormHook();
  const dpAccountFormHook = useDPAccountFormHook();
  const leiInformationHook = useLEIInformationFormHook();
  const addressInformationHook = useAddressFormDataHook();
  const basicDetailsFormHook = useBasicFormDataHook();
  return (
    <div className="max-w-4xl mt-6 mx-auto flex flex-col gap-4">
      
      <Card>
        <CardHeader>
          <CardTitle>Basic Informaiton</CardTitle>
          <CardDescription>
            Enter the basic Information for the participant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BasicDetailsForm manager={basicDetailsFormHook} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
          <CardDescription> Enter the address details</CardDescription>
        </CardHeader>
        <CardContent>
          <AddressInformatoin manager={addressInformationHook} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LEI Information</CardTitle>
          <CardDescription>
            Legal entity Identifier Information (Optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LEIInformation manager={leiInformationHook} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Account Detail</CardTitle>
          <CardDescription>Add bank Account Details</CardDescription>
        </CardHeader>
        <CardContent>
          <BankAccountDetails manager={bankAccountFormHook} />
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => {
              bankAccountFormHook.addBankAccount();
            }}
          >
            <Landmark className="w-4 h-4" />
            Add Bank Account
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DP Account Details</CardTitle>
          <CardDescription>
            Add depository participant account information (Atleast one
            required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DPAccountDetails manager={dpAccountFormHook} />
        </CardContent>
        <CardFooter className="flex flex-row gap-5">
          <Button
            variant="outline"
            onClick={() => {
              dpAccountFormHook.addDPAccount();
            }}
          >
            <Plus className="w-4 h-4" />
            Add Demat Account
          </Button>
        </CardFooter>
      </Card>

      <Button
        onClick={() => {
          bankAccountFormHook.validateAllBankAccounts();
          dpAccountFormHook.validateAllDPAccounts();
          leiInformationHook.validateLEIData();
          addressInformationHook.validateAddressData();
          basicDetailsFormHook.validateBasicData();
        }}
      >
        Create New Participant
      </Button>
    </div>
  );
};

export default CreateNSCParticipant;
