"use client";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import ViewKycDataComponent from "./_components/ViewKycDataComponent";
import CorporateKycView, { isNonIndividual } from "./_components/CorporateKycView";
import { useQuery } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Spinner } from "@/components/ui/spinner";

function CustomerKycView({ id }: { id: number }) {
  const profileApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["KycView", id],
    queryFn: async () => {
      const { data } = await profileApi.customerInfoById(id);
      return data.responseData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>NO KYC Data Found</p>
      </div>
    );
  }

  const title =
    data.userType && isNonIndividual(data.userType)
      ? `Corporate KYC - ${data.firstName || data.userType}`
      : `KYC Data - ${data.firstName}`;

  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title={title}
        description="Comprehensive KYC information and document verification status"
        showBack
      />

      {data.userType && isNonIndividual(data.userType) ? (
        <CorporateKycView data={data} />
      ) : (
        <ViewKycDataComponent data={data} />
      )}
    </div>
  );
}

export default CustomerKycView;
