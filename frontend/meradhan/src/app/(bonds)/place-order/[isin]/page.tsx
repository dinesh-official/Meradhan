import { Button } from "@/components/ui/button";
import { getSession } from "@/core/auth/_server/getSession";
import apiServerCaller from "@/core/connection/apiServerCaller";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import ViewPort from "@/global/components/wrapper/ViewPort";
import {
  getBondPurchaseEligibility,
  hasCrmInventoryAvailable,
} from "@/global/utils/bondPurchaseEligibility";
import {
  isKraVerified,
  isKycVerified,
} from "@/global/utils/customerVerification";
import { generateBondInfoPageMetaData } from "@/graphql/pagesMetaDataGql_Action";
import apiGateway, { BondOrderPricingData } from "@root/apiGateway";
import Image from "next/image";
import Link from "next/link";
import OrderStep from "../_components/OrderStep";
import { generateDraftPlaceOrderLabel } from "../_utils/calcAmount";
import { getMaxOrderQuantityFromBond } from "../_utils/quantity";
import { redirect } from "next/navigation";
export const revalidate = 0;

export const generateMetadata = async ({
  params,
  searchParams,
}: {
  params: Promise<{ isin: string }>;
  searchParams: Promise<{ quantity: string }>;
}) => {
  const { isin } = await params;
  return await generateBondInfoPageMetaData(isin, "place-order/[isin]");
};

async function page({ params, searchParams }: { params: Promise<{ isin: string }>, searchParams: Promise<{ quantity?: string, allowTrade?: string }> }) {
  const session = await getSession();
  const { isin } = await params;
  if (!session?.id) {
    redirect("/logout?redirect=/place-order/" + isin);
  }

  const { quantity, allowTrade } = await searchParams;

  const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);
  const orderId = generateDraftPlaceOrderLabel();
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiServerCaller
  );

  let responseData: Awaited<
    ReturnType<typeof apiCaller.getBondDetailsByIsin>
  >["responseData"] | null = null;
  let bondDetailsRequestFailed = false;
  try {
    const bondEnvelope = await apiCaller.getBondDetailsByIsin(isin);
    responseData = bondEnvelope.responseData ?? null;
  } catch {
    bondDetailsRequestFailed = true;
    responseData = null;
  }

  let orderPricing: BondOrderPricingData | null = null;
  if (responseData) {
    try {
      const requested = Number(quantity ?? 1);
      const safeRequested =
        Number.isFinite(requested) && requested >= 1 ? Math.floor(requested) : 1;
      const maxQ = getMaxOrderQuantityFromBond(responseData);
      const pricingQty = Math.min(safeRequested, maxQ);
      const pricingEnvelope = await apiCaller.getBondOrderPricing(
        isin,
        pricingQty,
      );
      if (pricingEnvelope.responseData) {
        orderPricing = pricingEnvelope.responseData;
      }
    } catch {
      orderPricing = null;
    }
  }



  let customerPayload: Awaited<
    ReturnType<typeof customerApi.customerInfoById>
  >["data"]["responseData"] | null = null;
  try {
    const userData = await customerApi.customerInfoById(Number(session.id));
    customerPayload = userData.data.responseData ?? null;
  } catch {
    customerPayload = null;
  }

  const kycOk = isKycVerified(session.kycStatus);
  const kraOk = isKraVerified(session.kraStatus);

  if (!kycOk || !kraOk) {
    return (
      <ViewPort hideNewsLetter>
        <div className="mb-4 container">
          <SectionWrapper>
            <div className="text-center py-20 flex justify-center items-center flex-col gap-5">
              <Image
                src="/images/icons/sad-emoji.svg"
                alt="KYC Verification"
                width={60}
                height={60}
              />
              <h2 className="text-2xl font-semibold mt-4">
                {!kycOk && !kraOk
                  ? "KYC & KRA Verification Required"
                  : !kycOk
                    ? "KYC Verification Required"
                    : "KRA Verification Pending"}
              </h2>
              <p className="text-gray-600 max-w-md">
                {!kycOk && !kraOk
                  ? "Please complete your KYC and wait for KRA verification before placing an order."
                  : !kycOk
                    ? "Please complete your KYC verification to place an order."
                    : "Your KRA registration is still pending. You can check the status on your profile."}
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {!kycOk ? (
                  <Link href="/dashboard/kyc">
                    <Button>Complete KYC</Button>
                  </Link>
                ) : null}
                {!kraOk ? (
                  <Link href="/dashboard/profile">
                    <Button variant={kycOk ? "default" : "outlineSecondary"}>
                      View profile
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </SectionWrapper>
        </div>
      </ViewPort>
    );
  }

  if (!responseData) {
    return (
      <ViewPort hideNewsLetter>
        <div className="container">
          <SectionWrapper>
            <div className="text-center py-20 flex justify-center items-center flex-col gap-5">
              <Image
                src="/images/icons/sad-emoji.svg"
                alt={bondDetailsRequestFailed ? "Load error" : "Bond Not Found"}
                width={60}
                height={60}
              />
              <h2 className="text-2xl font-semibold mt-4">
                {bondDetailsRequestFailed
                  ? "Couldn’t load bond"
                  : "Bond Not Found"}
              </h2>
              <p className="text-gray-600 max-w-md">
                {bondDetailsRequestFailed
                  ? "We couldn’t reach our servers or the request timed out. Refresh the page or try again in a moment."
                  : "The bond you are looking for does not exist."}
              </p>

              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {bondDetailsRequestFailed ? (
                  <Button asChild>
                    <Link href={`/place-order/${isin}`}>Try again</Link>
                  </Button>
                ) : null}
                <Button variant="outlineSecondary" asChild>
                  <Link href="/bonds">Back to Bonds</Link>
                </Button>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </ViewPort>
    );
  }



  if (!responseData.allowForPurchase) {
    return (
      <ViewPort hideNewsLetter>
        <div className="container">
          <SectionWrapper>
            <div className="text-center py-20 flex justify-center items-center flex-col gap-5">
              <Image
                src="/images/icons/sad-emoji.svg"
                alt="Order Not Allowed"
                width={60}
                height={60}
              />
              <h2 className="text-2xl font-semibold mt-4">Order Not Allowed</h2>
              <p className="text-gray-600">The bond you are looking for is not allowed for purchase.</p>
              <Link href="/bonds" className="mt-6 inline-block">
                <Button>Back to Bonds</Button>
              </Link>
            </div>
          </SectionWrapper>
        </div>
      </ViewPort>
    );
  }

  const purchase = getBondPurchaseEligibility(responseData);

  if (!purchase.eligible) {
    const missingFields = purchase.missingFields.join(", ");

    return (
      <ViewPort hideNewsLetter>
        <div className="container">
          <SectionWrapper>
            <div className="text-center py-20 flex justify-center items-center flex-col gap-5">
              <Image
                src="/images/icons/sad-emoji.svg"
                alt="Order Not Allowed"
                width={60}
                height={60}
              />
              <h2 className="text-2xl font-semibold mt-4">Order Not Allowed</h2>
              <p className="text-gray-600">The bond you are looking for is not allowed for purchase. Please contact support.</p>
              {
                allowTrade === "true" ? (
                  <p className="text-gray-600">The bond you are looking for is not allowed for purchase. {missingFields}</p>
                ) : null
              }

              <Link href="/bonds" className="mt-6 inline-block">
                <Button>Back to Bonds</Button>
              </Link>
            </div>
          </SectionWrapper>
        </div>
      </ViewPort>
    );
  }

  if (!hasCrmInventoryAvailable(responseData)) {
    return (
      <ViewPort hideNewsLetter>
        <div className="container">
          <SectionWrapper>
            <div className="text-center py-20 flex justify-center items-center flex-col gap-5">
              <Image
                src="/images/icons/sad-emoji.svg"
                alt="Bond out of stock"
                width={60}
                height={60}
              />
              <h2 className="text-2xl font-semibold mt-4">Bond out of stock</h2>
              <p className="text-gray-600 max-w-md">
                This bond has no sellable inventory right now. Try another listing or check back
                after availability is updated.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="outlineSecondary" asChild>
                  <Link href={`/bonds/detail/${isin}`}>View bond details</Link>
                </Button>
                <Button asChild>
                  <Link href="/bonds">Back to Bonds</Link>
                </Button>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </ViewPort>
    );
  }

  if (!customerPayload) {
    return (
      <ViewPort hideNewsLetter>
        <div className="container">
          <SectionWrapper>
            <div className="text-center py-20 flex justify-center items-center flex-col gap-5">
              <Image
                src="/images/icons/sad-emoji.svg"
                alt="Profile load error"
                width={60}
                height={60}
              />
              <h2 className="text-2xl font-semibold mt-4">
                Couldn’t load your profile
              </h2>
              <p className="text-gray-600 max-w-md">
                Please refresh the page. If this keeps happening, sign out and sign in again.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild>
                  <Link href={`/place-order/${isin}`}>Try again</Link>
                </Button>
                <Button variant="outlineSecondary" asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </Button>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </ViewPort>
    );
  }

  return (
    <ViewPort hideNewsLetter>
      <OrderStep
        bond={responseData}
        customer={customerPayload}
        orderId={orderId}
        orderPricing={orderPricing}
      />
    </ViewPort>
  );
}

export default page;
