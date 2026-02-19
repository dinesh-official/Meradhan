import { FaPercent, FaTag, FaUser } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { PiCurrencyInrBold } from "react-icons/pi";
import NameTitleView from "../_components/UserView/NameTitileView";
import AccountViewPort from "../_components/wrapper/AccountViewPort";
import DashBoardDataViewCard from "./_components/_cards/DashBoardDataViewCard";
import { DashBoardSatsCard } from "./_components/_cards/DashBoardSatsCard";
import OngoingDealsCard from "./_components/_cards/OngoingDealsCard";
import { getAccountPagesMetaData } from "@/graphql/getAccountPagesMetaData";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import apiServerCaller from "@/core/connection/apiServerCaller";
import apiGateway from "@root/apiGateway";
import { cookies } from "next/headers";

export const revalidate = 0;
export const generateMetadata = async () => {
  return await getAccountPagesMetaData("dashboard");
};

async function DashBoardPage() {
  const cookie = await cookies();
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiServerCaller
  );
  const id = cookie.get("userId")?.value || "";
  const profileData = await customerApi.customerInfoById(Number(id));
  const kycStatus = profileData.data.responseData.kycStatus;
  return (
    <AccountViewPort title={<NameTitleView />}>
      <div className="flex flex-col gap-5">
        <div className="bg-gray-100 p-4 px-5 rounded">
          <p>Explore your portfolio, offers, and deals — all in one place.</p>
        </div>

        <div className="gap-5 grid md:grid-cols-2 lg:grid-cols-4">
          <DashBoardSatsCard
            title="My Investments"
            icon={<FaSackDollar size={25} className="text-primary" />}
          >
            <p className="flex items-center font-medium text-primary text-3xl">
              <PiCurrencyInrBold /> 0
            </p>
          </DashBoardSatsCard>
          <DashBoardSatsCard
            title="Interest Earned"
            icon={<FaPercent size={18} className="text-primary" />}
          >
            <p className="flex items-center font-medium text-primary text-3xl">
              <PiCurrencyInrBold /> 0
            </p>
          </DashBoardSatsCard>
          <DashBoardSatsCard
            title="My KYC"
            icon={<FaUser size={19} className="text-secondary" />}
            className="bg-accent text-secondary"
          >
            {kycStatus == "PENDING" && (
              <div className="flex items-end flex-row justify-between gap-2">
                <p className="text-3xl font-medium">Not Done</p>
                <Link href={`/dashboard/kyc`}>
                  <Button variant="secondary">
                    Start KYC
                  </Button>
                </Link>
              </div>
            )}
            {kycStatus == "RE_KYC" && (
              <div className="flex items-end flex-row justify-between gap-2">
                <p className="text-3xl font-medium">Not Done</p>
                <Link href={`/dashboard/kyc`}>
                  <Button variant="secondary">
                    Re KYC
                  </Button>
                </Link>
              </div>
            )}
            {kycStatus == "VERIFIED" && <div className="flex items-end flex-row justify-between gap-2">
              <p className="text-3xl font-medium">Done</p>
            </div>}
            {kycStatus == "UNDER_REVIEW" && <div className="flex items-end flex-row justify-between gap-2">
              <p className="text-3xl font-medium">Under Review</p>
            </div>}
          </DashBoardSatsCard>
          <DashBoardSatsCard
            title="My Offers"
            icon={<FaTag size={20} className="text-primary" />}
          >
            <p className="flex items-center font-medium text-primary text-3xl">
              Explore
            </p>
          </DashBoardSatsCard>
        </div>
        <div className="gap-5 grid lg:grid-cols-2">
          <DashBoardDataViewCard
            title={
              <>
                My <span className="text-secondary">Portfolio</span>
              </>
            }
            isEmpty={true}
            emptyMessage="No investments available yet"
            ctaText="Explore All Bonds"
          />

          <DashBoardDataViewCard
            title={
              <>
                My <span className="text-secondary">Orders</span>
              </>
            }
            isEmpty={true}
            emptyMessage="No orders found"
          />
        </div>
        <OngoingDealsCard />
      </div>
    </AccountViewPort>
  );
}

export default DashBoardPage;