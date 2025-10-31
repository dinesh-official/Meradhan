import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Checkbox } from "@/components/ui/checkbox";
import { IoMdTrash } from "react-icons/io";
import { KycDataStorage } from "../../../_store/useKycDataStorage";

function DematAccountView({
  account,
  // name,
  setDefault,
  onDelete,
  myPan,
}: {
  account: KycDataStorage["step_4"][number];
  name: string;
  onDelete?: () => void;
  setDefault: () => void;
  myPan: string;
}) {
  // const isNameMatched = dataMatcherUtils.areNamesMatched(
  //   dataMatcherUtils.splitFullName(account.accountHolderName),
  //   dataMatcherUtils.splitFullName(name)
  // );

  return (
    <div className="flex flex-col gap-5 py-5 first:pt-0 border-gray-200 border-b">
      <div className="gap-5 grid sm:grid-cols-2 xl:grid-cols-4">
        <DataInfoLabel
          title="DP ID "
          status={account.isVerified ? "SUCCESS" : "ERROR"}
          statusLabel={account.isVerified ? "Verified" : "Invalid"}
          showStatus
        >
          <p className="font-medium">{account.dpId}</p>
        </DataInfoLabel>
        <DataInfoLabel
          title="Beneficiary / Client ID"
          status={account.isVerified ? "SUCCESS" : "ERROR"}
          statusLabel={account.isVerified ? "Verified" : "Invalid"}
          showStatus
        >
          <p className="font-medium">{account.beneficiaryClientId}</p>
        </DataInfoLabel>

        <DataInfoLabel
          title="PAN"
          status={account.panNumber.includes(myPan) ? "SUCCESS" : "ERROR"}
          statusLabel={
            account.panNumber.includes(myPan) ? "Matched" : "Invalid"
          }
          showStatus
        >
          <p className="font-medium">{account.panNumber.join(",")}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Depository">
          <p className="flex items-center gap-3 font-medium">
            {account.depositoryName}{" "}
            <IoMdTrash
              className="text-gray-600 cursor-pointer"
              size={16}
              onClick={onDelete}
            />
          </p>
        </DataInfoLabel>
      </div>
      <div className="gap-5 grid sm:grid-cols-2 xl:grid-cols-3">
        <DataInfoLabel
          title="Depository Participant Name"
          // status={account.isVerified ? "SUCCESS" : "ERROR"}
          // statusLabel={account.isVerified ? "Verified" : "Invalid"}
          // showStatus
        >
          <p className="font-medium">{account.depositoryParticipantName}</p>
        </DataInfoLabel>
        <DataInfoLabel
          title="Account Holder Name"
          // status={isNameMatched ? "SUCCESS" : "ERROR"}
          // showStatus
          // statusLabel={isNameMatched ? "Verified" : "Invalid"}
        >
          <p className="font-medium">{account.accountHolderName}</p>
        </DataInfoLabel>

        <DataInfoLabel title="Demat Account Type ">
          <p className="font-medium">{account.accountType}</p>
        </DataInfoLabel>

        <DataInfoLabel title="Is Default Demat Account?" status="SUCCESS">
          <p className="flex items-center gap-2 font-medium">
            <Checkbox
              checked={account.isDefault}
              onClick={() => setDefault()}
            />
            Yes
          </p>
        </DataInfoLabel>
      </div>
    </div>
  );
}

export default DematAccountView;
