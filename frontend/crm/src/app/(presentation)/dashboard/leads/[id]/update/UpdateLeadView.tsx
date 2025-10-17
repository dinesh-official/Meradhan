"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";
import LeadFormManagementForm from "../../_components/manageLeads/form/LeadFormManagementForm";
import { useLeadFormDataHook } from "../../_components/manageLeads/form/useLeadFormDataHook";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useLeadFollowUpApiHook } from "../../_components/manageLeads/form/useLeadApiHook";
import { appSchema } from "@root/schema";
import { toast } from "sonner";

const UpdateLeadView = ({ id }: { id: number }) => {
  console.log("id", id);
  const manager = useLeadFormDataHook();
  const {updateLeadMutation}=useLeadFollowUpApiHook()
  const fetchUser = async () => {
    const fetchLeadApi = new apiGateway.crm.crmLeads.CrmLeadApi(
      apiClientCaller
    );
    try {
      const { data } = await fetchLeadApi.getNewLeadById(id);
      const cs = data.responseData;

      manager.setLeadDataMany({
        fullName: cs.fullName ?? "",
        emailAddress: cs.emailAddress ?? "",
        phoneNo: cs.phoneNo ?? "",
        companyName: cs.companyName ?? undefined,
        leadSource: cs.leadSource,
        status: cs.status,
        bondType: cs.bondType ?? undefined,
        exInvestmentAmount: cs.exInvestmentAmount ?? undefined,
        note: cs.note ?? "",
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const { isLoading } = useQuery({
    queryKey: ["fetchLead", id],
    queryFn: fetchUser,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="w-full h-96 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

    const handleUpdate = () => {
    try {
      // parse/validate with the UPDATE schema
      const payload = appSchema.crm.leads.updateLeadSchema.parse(manager.state);
      updateLeadMutation.mutate({ leadId: id, data: payload });
    } catch {
      toast.error("Invalid input");
    }
  };

  return (
    <Card>
      <CardContent>
        <LeadFormManagementForm manager={manager} />
      </CardContent>
         <CardFooter>
          <Button
            onClick={handleUpdate}
            className="md:w-auto w-full"
            disabled={updateLeadMutation.isPending}
          >
            Update Customer
          </Button>
        </CardFooter>
    </Card>
  );
};

export default UpdateLeadView;
