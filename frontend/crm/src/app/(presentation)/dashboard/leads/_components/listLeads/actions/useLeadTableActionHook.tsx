import { Route } from "next";
import { useRouter } from "nextjs-toploader/app";
import React from "react";

export const useLeadTableActionHook = ({
  leadId,
}: {
  leadId: number;
}) => {
  const router = useRouter();
  const handleLeadUpdate = () => {
    const href = `/dashboard/leads/${encodeURIComponent(
      String(leadId)
    )}/update` as Route;

    router.push(href);
  };
  return {
    handleLeadUpdate,
  };
};
