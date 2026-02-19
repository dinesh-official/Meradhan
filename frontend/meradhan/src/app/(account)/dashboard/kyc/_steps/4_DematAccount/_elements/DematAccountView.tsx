import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { IoMdTrash } from "react-icons/io";
import { KycDataStorage } from "../../../_store/useKycDataStorage";

function DematAccountView({
  account,
  // name,
  setDefault,
  onDelete,
  hideBorder = false,
  readOnly = false,
}: {
  account: KycDataStorage["step_4"][number];
  name: string;
  onDelete?: () => void;
  setDefault: () => void;
  myPan: string;
  hideBorder?: boolean;
  readOnly?: boolean;
}) {
  // const isNameMatched = dataMatcherUtils.areNamesMatched(
  //   dataMatcherUtils.splitFullName(account.accountHolderName),
  //   dataMatcherUtils.splitFullName(name)
  // );

  return (
    <div
      className={cn(
        "flex flex-col gap-5 py-5 first:pt-0 border-gray-200 border-b last:border-b-0",
        hideBorder && "border-b-0",
      )}
    >
      <div className={cn("gap-5 grid sm:grid-cols-2 xl:grid-cols-4")}>
        {/* // not show dp id for cdsl */}
        {account.depositoryName != "CDSL" && (
          <DataInfoLabel
            title="DP ID "
            status={account.isVerified ? "SUCCESS" : "ERROR"}
            statusLabel={account.isVerified ? "Verified" : "Invalid"}
            showStatus
          >
            <p className="font-medium">{account.dpId}</p>
          </DataInfoLabel>
        )}
        <DataInfoLabel
          title="Beneficiary / Client ID"
          status={account.isVerified ? "SUCCESS" : "ERROR"}
          statusLabel={account.isVerified ? "Verified" : "Invalid"}
          className={account.depositoryName === "CDSL" ? "xl:col-span-2" : ""}
          showStatus
        >
          <p className="font-medium">{account.beneficiaryClientId}</p>
        </DataInfoLabel>

        <DataInfoLabel
          className={"xl:col-span-2"}
          title="PAN"
          // status={account.panNumber.includes(myPan) ? "SUCCESS" : "ERROR"}
          // statusLabel={
          //   account.panNumber.includes(myPan) ? "Matched" : "Invalid"
          // }
          status={account.isVerified ? "SUCCESS" : "ERROR"}
          statusLabel={account.isVerified ? "Matched" : "Not Matched"}
          showStatus
        >
          <p className="font-medium">{account.panNumber.join(",")}</p>
        </DataInfoLabel>
      </div>
      <div className="gap-5 grid sm:grid-cols-2 xl:grid-cols-4">
        <DataInfoLabel title="Depository">
          <p className="flex items-center gap-3 font-medium">
            {account.depositoryName || "--------"}{" "}
            {!readOnly && (
              <IoMdTrash
                className="text-gray-600 cursor-pointer"
                size={16}
                onClick={onDelete}
              />
            )}
          </p>
        </DataInfoLabel>

        <DataInfoLabel title="Demat Account Type ">
          <p className="font-medium">{account.accountType}</p>
        </DataInfoLabel>
        <DataInfoLabel
          className="xl:col-span-2"
          title="Depository Participant Name"
        // status={account.isVerified ? "SUCCESS" : "ERROR"}
        // statusLabel={account.isVerified ? "Verified" : "Invalid"}
        // showStatus
        >
          <p className="font-medium">
            {account.depositoryParticipantName || "Not Found"}
          </p>
        </DataInfoLabel>
      </div>
      <DataInfoLabel title="Is Default Demat Account?" status="SUCCESS">
        <label
          className={
            readOnly
              ? "flex items-center gap-2 font-medium cursor-default opacity-70"
              : "flex items-center gap-2 font-medium cursor-pointer"
          }
        >
          <Checkbox
            checked={account.isDefault}
            onClick={readOnly ? undefined : () => setDefault()}
            disabled={readOnly}
          />
          Yes
        </label>
      </DataInfoLabel>
    </div>
  );
}

export default DematAccountView;
