"use client";

/**
 * Wraps the 3 react-query mutations the 2-step corporate-KYC e-sign page
 * relies on:
 *
 *   1. `saveRiskProfile` — submits the corporate risk-profile answers
 *      through the existing customer-profile risk-profile endpoint.
 *   2. `kickOffDigio`    — asks the backend to download the operator-
 *      uploaded PDF and hand it to Digio, returning the iframe handoff
 *      payload (entity id + access-token id + signing parties).
 *   3. `verifyDigio`     — called from the Digio iframe success callback
 *      with the `digio_doc_id` it returns. Backend pulls the signed PDF
 *      from Digio, persists it to S3, and flips the row to COMPLETED.
 *
 * Centralised here so the step components don't have to instantiate the
 * api clients themselves.
 */

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";

export function useCorporateESign(requestId: number) {
  const corporateKycApi =
    new apiGateway.meradhan.customerCorporateKycApi.CorporateKycApi(
      apiClientCaller,
    );
  const customerAuthApi =
    new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(apiClientCaller);

  const saveRiskProfile = useMutation({
    mutationKey: ["corporate-esign", "save-risk-profile", requestId],
    mutationFn: async (
      answers: Array<{ qus: string; ans: string; index: number; opt: string[] }>,
    ) => {
      const res = await customerAuthApi.setRiskProfile(answers);
      return res;
    },
  });

  const kickOffDigio = useMutation({
    mutationKey: ["corporate-esign", "digio-request", requestId],
    mutationFn: async () => {
      const res = await corporateKycApi.digioRequestESign(requestId);
      return res.responseData;
    },
  });

  const verifyDigio = useMutation({
    mutationKey: ["corporate-esign", "digio-verify", requestId],
    mutationFn: async (digioDocId: string) => {
      const res = await corporateKycApi.digioVerifyESign(requestId, digioDocId);
      return res.responseData;
    },
  });

  return {
    saveRiskProfile,
    kickOffDigio,
    verifyDigio,
  };
}
