"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import CustomerManagementForm from "../../../_components/manageCustomer/form/CustomerManagementForm";
import { useCustomerApiHook } from "../../../_components/manageCustomer/form/useCustomerApiHook";
import { useCustomerFromDataHook } from "../../../_components/manageCustomer/form/useCustomerFormDataHook";

const UpdateCustomerView = ({ id }: { id: number }) => {
  const manager = useCustomerFromDataHook();
  const { updateCustomerMutation } = useCustomerApiHook({ backOnDone: true });

  const fetchUser = async () => {
    const fetchUserApi = new apiGateway.crm.customer.CrmCustomerApi(
      apiClientCaller
    );
    try {
      const { data } = await fetchUserApi.customerInfoById(id);
      const cs = data.responseData;

      manager.setData({
        emailId: cs.emailAddress,
        firstName: cs.firstName,
        gender: cs.gender,
        isEmailVerified: cs.utility.isEmailVerified,
        isPhoneVerified: cs.utility.isPhoneVerified,
        kycStatus: cs.kycStatus,
        lastName: cs.lastName,
        userName: cs.userName ?? "",
        legalEntityName: cs.legalEntityName ?? "",
        phoneNo: cs.phoneNo,
        status: cs.utility.accountStatus,
        termsAccepted: cs.utility.termsAccepted,
        userType: cs.userType,
        whatsAppNo: cs.whatsAppNo || "",
        whatsAppNotificationAllow: cs.utility.whatsAppNotificationAllow,
        middleName: cs.middleName,
        relationshipManagerId: cs.utility.relationshipManager?.id,
      });
      if (cs.utility.relationshipManager) {
        manager.relationManager.setRelationManager(
          cs.utility.relationshipManager || undefined
        );
      }
    } catch {
      // Silently handle error - will show error state in component
    }
  };

  const { isLoading } = useQuery({
    queryKey: ["fetchCustomer", id],
    queryFn: fetchUser,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-3xl">
      <Card>
        <CardContent>
          <CustomerManagementForm manager={manager} updateMode />
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              updateCustomerMutation.mutate({
                data: {
                  emailId: manager.state.emailId,
                  firstName: manager.state.firstName,
                  gender: ["INDIVIDUAL", "INDIVIDUAL_NRI_NRO"].includes(
                    manager.state.userType
                  )
                    ? manager.state.gender
                    : undefined,
                  isEmailVerified: manager.state.isEmailVerified,
                  isPhoneVerified: manager.state.isPhoneVerified,
                  kycStatus: manager.state.kycStatus,
                  lastName: manager.state.lastName,
                  legalEntityName: manager.state.legalEntityName?.trim() || undefined,
                  phoneNo: manager.state.phoneNo,
                  status: manager.state.status,
                  termsAccepted: manager.state.termsAccepted,
                  userType: manager.state.userType,
                  whatsAppNo: manager.state.whatsAppNo || undefined,
                  whatsAppNotificationAllow:
                    manager.state.whatsAppNotificationAllow,
                  middleName: manager.state.middleName || undefined,
                  relationshipManagerId:
                    manager.state.relationshipManagerId || undefined,
                },
                customerId: String(id),
              });
            }}
            className="w-full md:w-auto"
            disabled={updateCustomerMutation.isPending}
          >
            Update Customer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UpdateCustomerView;
