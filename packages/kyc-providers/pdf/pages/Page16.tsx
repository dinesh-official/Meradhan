import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import BankAccoutn from "../elements/BankAccoutn";

type BankAccount = {
  accountType?: string;
  ifscCode?: string;
  accountNumber?: string;
  accountHolderName?: string;
  micrCode?: string;
  bankName?: string;
  branch?: string;
  defaultAccount?: boolean;
};

function Page16({
  banks = [],
}: {
  banks?: BankAccount[];
}) {
  const nonDefaultBanks = banks.filter((e) => !e.defaultAccount);

  // Ensure at least 4 entries (fill blanks if fewer)
  const maxAccounts = 4;
  const filledBanks = Array.from({ length: maxAccounts }).map((_, idx) => {
    return (
      nonDefaultBanks[idx] || {
        defaultAccount: undefined,
        accountType: "",
        ifscCode: "",
        accountNumber: "",
        accountHolderName: "",
        micrCode: "",
        bankName: "",
        branch: "",
      }
    );
  });

  return (
    <View>
      {/* Title */}
      <Text style={tw(`font-bold uppercase text-[9px] text-center pt-6`)}>
        ANNEXURE 1
      </Text>

      <View style={tw("px-4")}>
        {/* Section Header */}
        <View style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-4")}>
          <Text style={tw("text-sm text-white font-[500] leading-[1px]")}>
            Additional Bank Account(s) Details
          </Text>
        </View>

        {/* Bank Accounts List */}
        <View style={tw(`flex flex-col gap-3`)}>
          {filledBanks.map((bank, idx) => (
            <BankAccoutn
              key={idx}
              index={idx + 2}
              isPrimary={bank.defaultAccount ?? undefined}
              accountType={bank.accountType?.toLowerCase() || " "}
              ifscCode={bank.ifscCode || " "}
              accountNumber={bank.accountNumber || " "}
              nameAsPerBank={bank.accountHolderName || " "}
              micrCode={""}
              bankName={bank.bankName || " "}
              branch={bank.branch || " "}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default Page16;
