"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";
import CustomerManagementForm from "../../../_components/manageCustomer/form/CustomerManagementForm";
import { Button } from "@/components/ui/button";
import { useCustomerTableActions } from "../../../_components/listView/actions/customerTableActionHook";
import { useParams } from "next/navigation";
import { useCustomerFromDataHook } from "../../../_components/manageCustomer/form/useCustomerFormDataHook";
import { useCustomerApiHook } from "../../../_components/manageCustomer/form/useCustomerApiHook";

const UpdateCustomerView = () => {
  const params = useParams();
  const id = Number(params?.id);

  const { fetchCustomerData } = useCustomerTableActions({ profileId: id });
  const u = fetchCustomerData.data?.responseData;

  console.log("fetchCustomerData", fetchCustomerData);
  const manager = useCustomerFromDataHook({
    firstName: u?.firstName ?? "",
    middleName: u?.middleName ?? null,
    lastName: u?.lastName ?? "",
    emailId: u?.emailAddress ?? "",
    gender: u?.gender ?? "MALE",
    kycStatus: u?.kycStatus ?? "PENDING",
    phoneNo: u?.phoneNo ?? "",
    status: u?.utility?.accountStatus ?? "ACTIVE",
    isEmailVerified: u?.utility?.isEmailVerified ?? false,
    isPhoneVerified: u?.utility?.isPhoneVerified ?? false,
    termsAccepted: u?.utility?.termsAccepted ?? false,
    whatsAppNotificationAllow: u?.utility?.whatsAppNotificationAllow ?? false,
    whatsAppNo: u?.whatsAppNo ?? null,
    userType: u?.userType ?? "INDIVIDUAL",
  });
  const { updateCustomerMutation } = useCustomerApiHook();

  return (
    <div className="max-w-3xl mt-6 mx-auto">
      <Card>
        <CardContent>
          <CustomerManagementForm manager={manager} />
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              updateCustomerMutation.mutate({
                data: {
                  ...manager.state,
                  middleName: manager.state.middleName ?? undefined,
                  whatsAppNo: manager.state.whatsAppNo ?? undefined,
                },
                customerId: String(id),
              });
            }}
            className="md:w-auto w-full"
            disabled={updateCustomerMutation.isPending}
          >
            UpdateUser Customer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UpdateCustomerView;
