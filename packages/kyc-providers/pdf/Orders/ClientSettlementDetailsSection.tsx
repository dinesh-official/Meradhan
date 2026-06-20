import { Text, View } from "@react-pdf/renderer";
import type { CustomerByIdPayload } from "@root/apiGateway";
import { tw } from "../MdPdf";
import {
  isNseRfqParticipantUser,
  shouldShowClientSettlementDetails,
} from "../helper";

interface SettlementBank {
  bankName?: string;
  ifscCode?: string;
  accountNo?: string;
}

interface SettlementDemat {
  dpName?: string;
  dpId?: string;
  benId?: string;
}

interface ClientSettlementDetailsSectionProps {
  user: CustomerByIdPayload;
  orderData?: {
    metadata?: {
      isRfqParticipant?: boolean;
      settlementBank?: SettlementBank;
      settlementDemat?: SettlementDemat;
    };
  };
}

export function ClientSettlementDetailsSection({
  user,
  orderData,
}: ClientSettlementDetailsSectionProps) {
  const settlementBank = orderData?.metadata?.settlementBank;
  const settlementDemat = orderData?.metadata?.settlementDemat;
  const primaryBank =
    user.bankAccounts?.find((e) => e.isPrimary) ?? user.bankAccounts?.[0];
  const primaryDemat =
    user.dematAccounts?.find((e) => e.isPrimary) ?? user.dematAccounts?.[0];

  const bankForCheck = isNseRfqParticipantUser(user, orderData)
    ? primaryBank
    : settlementBank ?? primaryBank ?? null;
  const dematForCheck = isNseRfqParticipantUser(user, orderData)
    ? primaryDemat
    : settlementDemat ?? primaryDemat ?? null;

  if (
    !shouldShowClientSettlementDetails(
      user,
      orderData,
      bankForCheck,
      dematForCheck,
    )
  ) {
    return null;
  }

  const bank = settlementBank
    ? {
        bankName: settlementBank.bankName ?? "—",
        ifscCode: settlementBank.ifscCode ?? "—",
        accountNumber: settlementBank.accountNo ?? "—",
      }
    : primaryBank;
  const demat = settlementDemat
    ? {
        depositoryParticipantName: settlementDemat.dpName ?? "—",
        dpId: settlementDemat.dpId ?? "—",
        clientId: settlementDemat.benId ?? "—",
      }
    : primaryDemat;

  return (
    <View style={tw(`flex flex-row border-b border-gray-300 `)}>
      <View style={tw(`text-[9px] flex w-[20%] flex-row gap-2`)}>
        <Text>Client Settlement Details (Buyer)</Text>
      </View>
      <View
        style={tw(
          `text-[9px] flex w-[40%] border-l border-gray-300 pl-2 flex-row gap-2`,
        )}
      >
        <Text>{`Bank Name: ${bank?.bankName}
IFSC Code: ${bank?.ifscCode}
Bank Account Number: ${bank?.accountNumber}`}</Text>
      </View>
      <View
        style={tw(
          `text-[9px] flex w-[40%] border-l border-gray-300 pl-2 flex-row gap-2`,
        )}
      >
        <Text>{`DP Name: ${demat?.depositoryParticipantName}${demat?.dpId?.length && demat?.dpId?.length >= 5 ? `\nDP ID: ${demat?.dpId}` : ""}\nClient ID: ${demat?.clientId}`}</Text>
      </View>
    </View>
  );
}
