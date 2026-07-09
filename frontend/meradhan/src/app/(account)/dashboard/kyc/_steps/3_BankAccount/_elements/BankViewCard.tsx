"use client";
import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { KycDataStorage } from "../../../_store/useKycDataStorage";
import { dataMatcherUtils } from "@/global/utils/matcher";
import { IoMdTrash } from "react-icons/io";
import { cn } from "@/lib/utils";

function BankViewCard({
  bank,
  name,
  onDelete,
  setDefault,
  hideBorder = false,
  readOnly = false,
}: {
  bank: KycDataStorage["step_3"][number];
  name: string;
  onDelete?: () => void;
  setDefault: () => void;
  hideBorder?: boolean;
  readOnly?: boolean;
}) {
  const isNameMatched = dataMatcherUtils.areNamesMatched(
    dataMatcherUtils.splitFullName(bank.beneficiary_name),
    dataMatcherUtils.splitFullName(name)
  );
  return (
    <div className={cn("flex flex-col gap-5 py-5 first:pt-0 border-gray-200 border-b", hideBorder && "border-b-0")} >
      <div className="gap-5 grid sm:grid-cols-2">
        <DataInfoLabel
          title="Bank"
          status={bank.isVerified ? "SUCCESS" : "ERROR"}
          statusLabel={bank.isVerified ? "Verified" : "Invalid"}
          showStatus
        >
          <p className="flex items-center gap-2">
            {bank.bankName}{" "}
            {!readOnly && (
              <IoMdTrash
                className="text-[#AAAAAA] cursor-pointer"
                size={16}
                onClick={onDelete}
              />
            )}
          </p>
        </DataInfoLabel>
        <DataInfoLabel
          title="Name as per your bank account"
        // status={isNameMatched ? "SUCCESS" : "ERROR"}
        // statusLabel={isNameMatched ? "Matched" : "Not Matched"}
        // showStatus
        >
          <p className="font-medium text-sm">{bank.beneficiary_name}</p>
        </DataInfoLabel>
      </div>

      <div className="gap-5 grid sm:grid-cols-2 lg:grid-cols-4">
        <DataInfoLabel title="Account Number ">
          <p className="font-medium text-sm">{bank.accountNumber}</p>
        </DataInfoLabel>
        <DataInfoLabel title="IFSC Code ">
          <p className="font-medium text-sm">{bank.ifscCode}</p>
        </DataInfoLabel>

        <DataInfoLabel title="Bank Account Type">
          <p className="capitalize">{bank.bankAccountType}</p>
        </DataInfoLabel>
        <DataInfoLabel
          title="Branch"
          status={bank.isVerified ? "SUCCESS" : "ERROR"}
          statusLabel={bank.isVerified ? "Verified" : "Invalid"}

        >
          <p className="font-medium text-sm">{bank.branchName}</p>
        </DataInfoLabel>
      </div>
      <label
        className={cn(
          "flex lg:items-center gap-2 mt-3 text-sm",
          readOnly ? "cursor-default opacity-70" : "cursor-pointer"
        )}
      >
        <Checkbox
          checked={bank.isDefault}
          onClick={readOnly ? undefined : () => setDefault()}
          disabled={readOnly}
        />
        <p className="text-sm">
          Set this account as default bank account for making future investments
          on MeraDhan
        </p>
      </label>
    </div>
  );
}

export default BankViewCard;
