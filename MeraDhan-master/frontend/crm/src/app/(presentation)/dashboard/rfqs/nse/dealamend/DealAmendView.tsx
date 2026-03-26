"use client";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function DealAmendView() {
  const rfqAPI = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);
  const {} = useQuery({
    queryKey: [""],
    queryFn: async () => {
      return await rfqAPI.getAllDealamend({});
    },
  });

  return <div>DealAmendView</div>;
}

export default DealAmendView;
