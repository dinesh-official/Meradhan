import { Button } from "@/components/ui/button";
import { getSession } from "@/core/auth/_server/getSession";
import apiServerCaller from "@/core/connection/apiServerCaller";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import ViewPort from "@/global/components/wrapper/ViewPort";
import apiGateway from "@root/apiGateway";
import Image from "next/image";
import Link from "next/link";
import OrderStep from "../_components/OrderStep";
import { generateOrderId } from "../_utils/calcAmount";
import { generateBondInfoPageMetaData } from "@/graphql/pagesMetaDataGql_Action";
import { redirect } from "next/navigation";
export const revalidate = 0;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ isin: string }>;
}) => {
  const { isin } = await params;
  return await generateBondInfoPageMetaData(isin, "place-order/[isin]");
};

async function page({ params }: { params: Promise<{ isin: string }> }) {
  const { isin } = await params;
  const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);
  const orderId = generateOrderId({});
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiServerCaller
  );

  const { responseData } = await apiCaller.getBondDetailsByIsin(isin);
  const session = await getSession();
  if (!session?.id) {
    redirect("/logout");
  }
  const userData = await customerApi.customerInfoById(Number(session?.id));

  if (session?.kycStatus !== "VERIFIED") {
    return (
      <ViewPort>
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
                KYC Verification Required
              </h2>
              <p className="text-gray-600">
                Please complete your KYC verification to place an order.
              </p>
              <Link href="/dashboard/kyc" className="mt-6 inline-block">
                <Button>Process KYC Now</Button>
              </Link>
            </div>
          </SectionWrapper>
        </div>
      </ViewPort>
    );
  }

  return (
    <ViewPort>
      <OrderStep
        bond={responseData}
        customer={userData.data.responseData}
        orderId={orderId}
      />
    </ViewPort>
  );
}

export default page;
