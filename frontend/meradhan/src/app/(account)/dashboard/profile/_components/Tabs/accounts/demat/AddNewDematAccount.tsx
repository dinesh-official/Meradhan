"use client";
import React, { useEffect } from "react";
import NewDematAccount from "./NewDematAccount";
import { useAddNewDematAccountFormHook } from "./useAddNewDematAccount";
import { GetCustomerResponseById } from "@root/apiGateway";
import { makeFullname } from "@/global/utils/formate";

function AddNewDematAccount({
  profile,
  onCancel,
}: {
  profile?: GetCustomerResponseById["responseData"];
  onCancel?: () => void;
}) {
  const { handelSubmit, isPending, error, data, updateData } =
    useAddNewDematAccountFormHook({ onComplete: onCancel });

  useEffect(() => {
    updateData(
      "accountHolderName",
      makeFullname({
        firstName: profile?.firstName || "",
        middleName: profile?.middleName || "",
        lastName: profile?.lastName || "",
      })
    );
    updateData(
      "panNumber",
      profile?.panCard?.panCardNo ? [profile.panCard.panCardNo] : []
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-5">
      <NewDematAccount
        data={data}
        error={error}
        isPending={isPending}
        updateData={updateData}
        showCancel={true}
        handelSubmit={() => {
          handelSubmit();
        }}
        onCancel={onCancel}
        myPan={profile?.panCard?.panCardNo || ""}
      />
    </div>
  );
}

export default AddNewDematAccount;
