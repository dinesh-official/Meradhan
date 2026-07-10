/**
 * 2-step Corporate KYC e-sign page.
 *
 * Step 1 — answer the corporate risk-profile questions
 *   (`CORPORATE_RISK_PROFILE_QUESTIONS`, served by the meradhan
 *   `/risk-profile/questions` endpoint and submitted through the existing
 *   `/api/auth/customer/profile/risk-profile` POST).
 *
 * Step 2 — sign via Digio's iframe SDK. The backend downloads an
 * operator-uploaded PDF or generates one from corporate KYC + risk profile,
 * hands it to Digio, returns the iframe handoff payload, and verifies the
 * signed doc id after the iframe success callback.
 *
 * This server entry fetches the request detail (ownership-guarded
 * server-side) and bails out early if the row is not PENDING or not
 * owned. The actual 2-step UI is in the client component.
 */

import AccountViewPort from "@/app/(account)/_components/wrapper/AccountViewPort";
import apiServerCaller from "@/core/connection/apiServerCaller";
import { getSession } from "@/core/auth/_server/getSession";
import apiGateway, { type CorporateESignRequest } from "@root/apiGateway";
import { notFound, redirect } from "next/navigation";
import { CorporateESignFlowView } from "./_components/CorporateESignFlowView";

/**
 * Subset of `CustomerByIdPayload["riskProfile"]["data"]` we forward to the
 * client. Used to pre-fill the corporate risk-profile step when the
 * customer has answered an overlapping question previously (matched by
 * `qus` text). Trimmed down so we never accidentally leak more profile
 * data than we need.
 */
export type PriorRiskProfileAnswer = { qus: string; ans: string };

export const revalidate = 0;

export const generateMetadata = async () => ({
  title: "Corporate KYC e-sign — Meradhan",
});

type PageProps = {
  params: Promise<{ requestId: string }>;
};

async function CorporateESignPage({ params }: PageProps) {
  const { requestId: requestIdParam } = await params;
  const requestId = Number(requestIdParam);
  if (!Number.isFinite(requestId)) {
    notFound();
  }

  const session = await getSession();
  if (!session?.id) {
    redirect("/login");
  }

  const corporateKycApi =
    new apiGateway.meradhan.customerCorporateKycApi.CorporateKycApi(
      apiServerCaller,
    );
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiServerCaller,
  );

  let request: CorporateESignRequest | null = null;
  let priorAnswers: PriorRiskProfileAnswer[] = [];
  try {
    const [requestRes, customerRes] = await Promise.all([
      corporateKycApi.getESignRequest(requestId),
      customerApi.customerInfoById(session.id),
    ]);
    request = requestRes.responseData?.request ?? null;
    priorAnswers =
      customerRes.data.responseData?.riskProfile?.data
        ?.filter((a) => Boolean(a.qus) && Boolean(a.ans))
        ?.map((a) => ({ qus: a.qus, ans: a.ans })) ?? [];
  } catch {
    // Either the backend is down or the customer doesn't own this row;
    // both flow to the dashboard so the user doesn't get stuck on a
    // dead-end page. The banner there will refresh on next render.
    redirect("/dashboard");
  }

  if (!request) {
    redirect("/dashboard");
  }
  // Backend stores status as the Prisma enum but it serialises to a
  // string here — both PENDING (continue) and COMPLETED/REJECTED
  // (already done) are handled below.
  if (request.status !== "PENDING") {
    redirect("/dashboard");
  }

  return (
    <AccountViewPort title="Corporate KYC e-sign">
      <CorporateESignFlowView request={request} priorAnswers={priorAnswers} />
    </AccountViewPort>
  );
}

export default CorporateESignPage;
