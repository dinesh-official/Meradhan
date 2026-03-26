"use client";
import apiGateway, {
  ApiError,
  GetCustomerResponseById,
} from "@root/apiGateway";
import React, { useState } from "react";
import DematAccountView from "../../../kyc/_steps/4_DematAccount/_elements/DematAccountView";
import { makeFullname } from "@/global/utils/formate";
import { FaPlusSquare } from "react-icons/fa";
import AddNewDematAccount from "./accounts/demat/AddNewDematAccount";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryClient } from "@/core/config/service-clients";
import Swal from "sweetalert2";

function DematAccounts({
  profile,
  allowAddNew = true,
}: {
  profile: GetCustomerResponseById["responseData"];
  allowAddNew?: boolean;
}) {
  const [showNew, setShowNew] = useState(false);
  const readOnly = profile.kycStatus !== "VERIFIED";

  const apiModel = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller
  );

  const removeDefaultDematAccountMutation = useMutation({
    mutationKey: ["remove-default-demat-account"],
    mutationFn: async (id: number) => {
      return await apiModel.removeDematAccount(id);
    },
    onSuccess: (data) => {
      console.log("Default demat account removed successfully", data);
      toast.success("Default demat account removed successfully");
      queryClient.invalidateQueries({ queryKey: ["profile-page"] });
    },
    onError: (error: unknown) => {
      console.error("Error removing default demat account", error);
      if (error instanceof ApiError) {
        toast.error(
          `${error.response?.data.message ||
          "An error occurred while removing the default demat account."
          } `
        );
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    },
  });

  const setDefaultDematAccountMutation = useMutation({
    mutationKey: ["set-default-demat-account"],
    mutationFn: async (id: number) => {
      return await apiModel.setPrimaryDematAccount(id);
    },
    onSuccess: (data) => {
      console.log("Default bank account set successfully", data);
      toast.success("Default bank account set successfully");
      queryClient.invalidateQueries({ queryKey: ["profile-page"] });
    },
    onError: (error: unknown) => {
      console.error("Error setting default bank account", error);
      if (error instanceof ApiError) {
        toast.error(
          `${error.response?.data.message ||
          "An error occurred while setting the default bank account."
          } `
        );
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    },
  });

  return (
    <div className="mt-5">
      {profile.dematAccounts.map((dematAccount, index) => (
        <DematAccountView
          readOnly={readOnly}
          hideBorder={index === profile.dematAccounts.length - 1 && !allowAddNew}
          setDefault={() => {
            setDefaultDematAccountMutation.mutate(dematAccount.id!);
          }}
          onDelete={() => {
            if (dematAccount.isPrimary) {
              toast.error("Cannot delete the default demat account.");
              return;
            }
            Swal.fire({
              title: "Are you sure?",
              text: "You won't be able to revert this!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, delete it!",
            }).then((result) => {
              if (result.isConfirmed) {
                // If the demat account to be deleted is default, remove default first

                removeDefaultDematAccountMutation.mutate(dematAccount.id!);
              }
            });
          }}
          key={index}
          account={{
            accountHolderName: dematAccount.accountHolderName,
            isDefault: dematAccount.isPrimary,
            accountType: dematAccount.accountType,
            beneficiaryClientId: dematAccount.clientId,
            checkTerms: true,
            depositoryName: dematAccount.depositoryName,
            depositoryParticipantName: dematAccount.depositoryParticipantName,
            dpId: dematAccount.dpId,
            isVerified: dematAccount.isVerified,
            panNumber: [dematAccount.primaryPanNumber],
          }}
          myPan={profile.panCard?.panCardNo || ""}
          name={makeFullname({
            firstName: profile.firstName || "",
            middleName: profile.middleName || "",
            lastName: profile.lastName || "",
          })}
        />
      ))}
      {allowAddNew && (
        <>
          <div className="flex items-center mt-6">
            {profile.bankAccounts.length < 5 && (
              <div
                onClick={() => {
                  setShowNew(!showNew);
                }}
                className="flex items-center gap-3 px-0 text-sm cursor-pointer"
              >
                <FaPlusSquare className="text-secondary text-lg" />
                Add Demat Account{" "}
                <span className="text-gray-500 text-xs">(Max 5 accounts)</span>
              </div>
            )}
          </div>
          {showNew && (
            <AddNewDematAccount
              profile={profile}
              onCancel={() => setShowNew(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default DematAccounts;
