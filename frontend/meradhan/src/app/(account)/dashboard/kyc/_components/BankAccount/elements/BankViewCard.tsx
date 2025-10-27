import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

function BankViewCard() {
  return (
    <div className="flex flex-col gap-5 py-5 first:pt-0 border-gray-200 border-b">
      <div className="gap-5 grid sm:grid-cols-2">
        <DataInfoLabel
          title="Bank"
          status="SUCCESS"
          statusLabel="Verified"
          showStatus
        >
          <p className="font-medium">HDFC Bank</p>
        </DataInfoLabel>
        <DataInfoLabel
          title="Name"
          status="SUCCESS"
          statusLabel="Verified"
          showStatus
        >
          <p className="font-medium">Sourav Bapari</p>
        </DataInfoLabel>
      </div>

      <div className="gap-5 grid sm:grid-cols-2 lg:grid-cols-4">
        <DataInfoLabel title="Account Number ">
          <p className="font-medium">9876543456780</p>
        </DataInfoLabel>
        <DataInfoLabel title="IFSC Code ">
          <p className="font-medium">UTIB0000056</p>
        </DataInfoLabel>

        <DataInfoLabel title="Bank Account Type">
          <p className="font-medium">savings</p>
        </DataInfoLabel>
        <DataInfoLabel
          title="Branch"
          status="SUCCESS"
          showStatus
          statusLabel="Verified"
        >
          <p className="font-medium">GURGAON</p>
        </DataInfoLabel>
      </div>
      <div className="flex lg:items-center gap-2 mt-3 text-sm">
        <Checkbox />
        <p>
          Set this account as default bank account for making future investments
          on MeraDhan
        </p>
      </div>
    </div>
  );
}

export default BankViewCard;
