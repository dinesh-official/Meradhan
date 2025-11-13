"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import ReactJson from 'react-json-view'
function ShowResponseJson({id}:{id:number}) {
  const apiGt = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller
  );

  const {data} = useQuery({
    queryKey: ["KycProgressStoreCrm"],
    queryFn: async () => {
      const data = await apiGt.getKycProgressStoreCrm(id);
      return data;
    },
  });

  return <Card>
    <CardHeader>
      <CardTitle  className="text-sm" >Response JSON</CardTitle>
      </CardHeader>
      <CardContent>
            <ReactJson src={(data?.responseData?.data.step_1.pan.response )} collapsed />
    </CardContent>
  </Card>;
}

export default ShowResponseJson;
