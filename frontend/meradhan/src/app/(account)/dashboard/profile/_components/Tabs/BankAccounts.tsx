"use client";
import { queryClient } from "@/core/config/service-clients";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { makeFullname } from "@/global/utils/formate";
import apiGateway, {
  ApiError,
  GetCustomerResponseById,
} from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaPlusSquare } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import BankViewCard from "../../../kyc/_steps/3_BankAccount/_elements/BankViewCard";
import AddNewBankAccount from "./accounts/bank/AddNewBankAccount";

function BankAccounts({
  profile,
  allowAddNew = true,
}: {
  profile: GetCustomerResponseById["responseData"];
  allowAddNew?: boolean;
}) {
  const readOnly = profile.kycStatus !== "VERIFIED";
  const [showAddNew, setShowAddNew] = useState(false);
  const [confirmDefaultBankId, setConfirmDefaultBankId] = useState<
    number | null
  >(null);

  const apiModel = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller
  );

  const removeDefaultBankAccountMutation = useMutation({
    mutationKey: ["remove-default-bank-account"],
    mutationFn: async (id: number) => {
      return await apiModel.removeBankAccount(id);
    },
    onSuccess: (data) => {
      console.log("Default bank account removed successfully", data);
      toast.success("Default bank account removed successfully");
      queryClient.invalidateQueries({ queryKey: ["profile-page"] });
    },
    onError: (error: unknown) => {
      console.error("Error removing default bank account", error);
      if (error instanceof ApiError) {
        toast.error(
          `${error.response?.data.message ||
          "An error occurred while removing the default bank account."
          } `
        );
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    },
  });

  const setDefaultBankAccountMutation = useMutation({
    mutationKey: ["set-default-bank-account"],
    mutationFn: async (id: number) => {
      return await apiModel.setPrimaryBankAccount(id);
    },
    onSuccess: async () => {
      toast.success("Default bank account set successfully");
      await queryClient.invalidateQueries({ queryKey: ["profile-page"] });
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

  const isUpdatingDefault = setDefaultBankAccountMutation.isPending;

  return (
    <div className="relative pt-5 min-h-[120px]">
      {isUpdatingDefault && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80"
          aria-busy="true"
          aria-label="Updating default bank account"
        >
          <Spinner className="size-8 text-primary" />
        </div>
      )}
      {profile.bankAccounts.map((bankAccount, index) => (
        <BankViewCard
          readOnly={readOnly}
          hideBorder={index === profile.bankAccounts.length - 1 && !allowAddNew}
          key={bankAccount.id}
          // bank={bankAccount.bankName || "--"}
          name={bankAccount.accountHolderName}
          bank={{
            accountNumber: bankAccount.accountNumber,
            ifscCode: bankAccount.ifscCode,
            bankName: bankAccount.bankName,
            branchName: bankAccount.branch,
            bankAccountType: bankAccount.bankAccountType,
            beneficiary_name: makeFullname({
              firstName: profile.firstName,
              middleName: profile.middleName,
              lastName: profile.lastName,
            }),
            isDefault: bankAccount.isPrimary,
            isVerified: bankAccount.isVerified,
            checkTerms: false,
          }}
          setDefault={() => {
            if (!bankAccount.isPrimary) {
              setConfirmDefaultBankId(bankAccount.id);
            } else {
              toast.error("This bank account is already the default account.");
            }
          }}
          onDelete={() => {
            if (bankAccount.isPrimary) {
              toast.error("Cannot delete the default bank account.");
            } else {
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
                  removeDefaultBankAccountMutation.mutate(bankAccount.id);
                }
              });
            }
          }}
        />
      ))}
      {
        allowAddNew && (
          <>
            <div className="flex items-center mt-6">
              {profile.bankAccounts.length < 5 && (
                <div
                  onClick={() => {
                    setShowAddNew(!showAddNew);
                  }}
                  className="flex items-center gap-3 px-0 text-sm cursor-pointer"
                >
                  <FaPlusSquare className="text-secondary text-lg" />
                  Add Bank Account{" "}
                  <span className="text-gray-500 text-xs">(Max 5 accounts)</span>
                </div>
              )}
            </div>
            {showAddNew && (
              <AddNewBankAccount
                onCancel={() => setShowAddNew(false)}
                profile={profile}
              />
            )}
          </>
        )
      }

      <AlertDialog
        open={confirmDefaultBankId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDefaultBankId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Set as Default Bank Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set this bank account as your default for future investments via MeraDhan?
              Payments will be made directly to the clearing corporation using this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={(ev) => {
                ev.preventDefault();
                if (confirmDefaultBankId == null) return;
                const id = confirmDefaultBankId;
                setConfirmDefaultBankId(null);
                setDefaultBankAccountMutation.mutate(id);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default BankAccounts;
