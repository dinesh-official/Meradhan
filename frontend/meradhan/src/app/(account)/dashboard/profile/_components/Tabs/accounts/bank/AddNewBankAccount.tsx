import NewBankForm from "@/app/(account)/dashboard/kyc/_steps/3_BankAccount/_hooks/NewBankForm";
import { useAddNewBankAccountFormHook } from "./useAddNewBankAccountFormHook";
import { GetCustomerResponseById } from "@root/apiGateway";
import { useEffect } from "react";
import { makeFullname } from "@/global/utils/formate";

function AddNewBankAccount({
  onCancel,
  profile,
}: {
  onCancel?: () => void;
    profile?: GetCustomerResponseById["responseData"];
  
}) {
  const {
    data,
    updateData,
    error,
    fetchBankIfsc,
    isPending,
    handleBankAccountSubmit,
  } = useAddNewBankAccountFormHook({onComplete: onCancel});

  useEffect(() => {
    updateData(
      "beneficiary_name",
      makeFullname({
        firstName: profile?.firstName || "",
        middleName: profile?.middleName || "",
        lastName: profile?.lastName || "",
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-5">
      <NewBankForm
        data={data}
        updateData={updateData}
        error={error}
        fetchBankIfsc={() => fetchBankIfsc.mutate()}
        isPending={isPending}
        handleBankAccountSubmit={() => handleBankAccountSubmit()}
        showCancel={true}
        showSetDefault={true}
        onCancel={() => onCancel && onCancel()}
      />
    </div>
  );
}

export default AddNewBankAccount;
