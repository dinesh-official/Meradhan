/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import DemateAccount from "../elements/DemateAccount";
import { splitInto8 } from "../dataMapper";

type DematAccount = {
  defaultAccount?: boolean;
  depository?: string;
  depositoryParticipantName?: string;
  accountHolderName?: string;
  dpId?: string;
  clientId?: string;
  accountType?: string;
  id?: string;
  pan?: string;
  response?: any;
};

function Page17({ demates = [] }: { demates?: DematAccount[] }) {
  // Always render at least 4 demat accounts (blank if missing)
  const nonDefaultDemates = demates.filter((e) => !e.defaultAccount);
  const maxAccounts = 4;
  const dematAccounts = [...nonDefaultDemates];

  while (dematAccounts.length < maxAccounts) {
    dematAccounts.push({
      defaultAccount: false,
      depository: " ",
      depositoryParticipantName: " ",
      accountHolderName: " ",
      dpId: " ",
      clientId: " ",
      accountType: " ",
      id: " ",
      pan: " ",
      response: null,
    });
  }

  return (
    <View>
      <Text style={tw(`font-bold uppercase text-[9px] text-center pt-6`)}>
        ANNEXURE 2
      </Text>

      <View style={tw("px-4")}>
        <View
          style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-4")}
        >
          <Text style={tw("text-sm text-white font-[500] leading-[1px]")}>
            Additional Demat Account(s) Details
          </Text>
        </View>

        <View style={tw(`flex flex-col gap-3`)}>
          {dematAccounts.map((d, idx) => (
            <DemateAccount
              key={idx}
              isPrimary={d.defaultAccount}
              depository={d.depository as any}
              dpName={d.depositoryParticipantName}
              nameAsPerPAN={d.accountHolderName}
              dpId={
                d.depository == "CDSL"
                  ? splitInto8(d.clientId || "")?.[0] || ""
                  : d.dpId
              }
              beneficiaryId={
                d.depository == "CDSL"
                  ? splitInto8(d.clientId || "")?.[1] || ""
                  : d.clientId
              }
              index={idx + 2}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default Page17;
