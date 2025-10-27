import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

function DematAccountView() {
  return (
    <div className="flex flex-col gap-5 py-5 first:pt-0 border-gray-200 border-b">
      <div className="gap-5 grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <DataInfoLabel
          title="DP ID "
          status="SUCCESS"
          statusLabel="Verified"
          showStatus
        >
          <p className="font-medium">IN301151</p>
        </DataInfoLabel>
        <DataInfoLabel
          title="Beneficiary / Client ID"
          status="SUCCESS"
          statusLabel="Verified"
          showStatus
        >
          <p className="font-medium">25112106</p>
        </DataInfoLabel>

        <DataInfoLabel title="PAN">
          <p className="font-medium">AADPM2907K</p>
        </DataInfoLabel>
        <DataInfoLabel title="Depository">
          <p className="font-medium">CDSL</p>
        </DataInfoLabel>

        <DataInfoLabel title="Depository Participant Name">
          <p className="font-medium">sadad</p>
        </DataInfoLabel>
        <DataInfoLabel
          title="Account Holder Name"
          status="SUCCESS"
          showStatus
          statusLabel="Verified"
        >
          <p className="font-medium">asdssad</p>
        </DataInfoLabel>

        <DataInfoLabel
          title="Demat Account Type "
          status="SUCCESS"
          showStatus
          statusLabel="Verified"
        >
          <p className="font-medium">SINGLE</p>
        </DataInfoLabel>

        <DataInfoLabel
          title="Is Default Demat Account?"
          status="SUCCESS"
          showStatus
          statusLabel="Verified"
        >
          <p className="flex items-center gap-2 font-medium">
            <Checkbox /> Yes
          </p>
        </DataInfoLabel>
      </div>
    </div>
  );
}

export default DematAccountView;
