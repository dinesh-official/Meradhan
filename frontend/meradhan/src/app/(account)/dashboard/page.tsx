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
import type { Order, InvestmentByIssuerTypeResponse } from "@root/apiGateway";
import { cookies } from "next/headers";
import { DashboardOrdersPreview } from "./_components/DashboardOrdersPreview";
import { DashboardPortfolioDonut } from "./_components/DashboardPortfolioDonut";
import CorporateESignBanner from "./_components/_banners/CorporateESignBanner";

export const revalidate = 0;
export const generateMetadata = async () => {
  return await getAccountPagesMetaData("dashboard");
};

function formatDashboardInr(currency: string, amount: unknown): string {
  const n =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(String(amount).replace(/,/g, ""))
        : NaN;
  if (!Number.isFinite(n)) {
    return `${currency} —`;
  }
  return `${currency} ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

async function DashBoardPage() {
  const cookie = await cookies();
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiServerCaller
  );
  const id = cookie.get("userId")?.value || "";
  const profileData = await customerApi.customerInfoById(Number(id));
  const kycStatus = profileData.data.responseData.kycStatus;
  const hasKycStarted =
    kycStatus == "PENDING" &&
    profileData.data.responseData.kycProgress?.hasStarted;

  const userIdNum = Number(id);
  const hasSession = Number.isFinite(userIdNum) && userIdNum > 0;

  let investedDisplay = `${formatDashboardInr("₹", 0)}`;
  let interestEarnedDisplay = `${formatDashboardInr("₹", 0)}`;

  const emptyPortfolio: Array<{
    id: number;
    securityName: string;
    isin: string;
    investmentAmount: number;
  }> = [];
  const emptyOrders: Order[] = [];
  let portfolioIssuer: InvestmentByIssuerTypeResponse | null = null;

  let portfolioPreview = emptyPortfolio;
  let ordersPreview: Order[] = emptyOrders;

  if (hasSession) {
    try {
      const portfolioApi = new apiGateway.meradhan.customerPortfolioApi(
        apiServerCaller
      );
      const orderApi = new apiGateway.meradhan.customerOrderApi(apiServerCaller);

      const [summaryRes, detailsRes, ordersRes, issuerRes] = await Promise.all([
        portfolioApi.getPortfolioSummary(),
        portfolioApi.getPortfolioDetails({ page: 1, limit: 5 }),
        orderApi.getOrderHistory({ page: "1", limit: "5" }),
        portfolioApi.getInvestmentByIssuerType(),
      ]);

      const summary = summaryRes?.responseData;
      if (summary) {
        investedDisplay = formatDashboardInr(
          summary.currency ?? "₹",
          summary.investedAmount
        );
        interestEarnedDisplay = formatDashboardInr(
          summary.currency ?? "₹",
          summary.interestEarnedToDate ?? 0,
        );
      }

      portfolioPreview =
        detailsRes?.responseData?.data?.map((row) => ({
          id: row.id,
          securityName: row.securityName,
          isin: row.isin,
          investmentAmount: row.investmentAmount,
        })) ?? emptyPortfolio;

      portfolioIssuer = issuerRes?.responseData ?? null;

      ordersPreview = ordersRes?.responseData?.data ?? emptyOrders;
    } catch {
      /* keep defaults — dashboard still renders */
    }
  }

  const portfolioEmpty = portfolioPreview.length === 0;
  const ordersEmpty = ordersPreview.length === 0;

  return (
    <AccountViewPort
      title={<NameTitleView />}
    >
      <div className="flex flex-col gap-5">
        <CorporateESignBanner />
        <div className="bg-gray-100 p-4 px-5 rounded">
          <p>Explore your portfolio, offers, and deals — all in one place.</p>
        </div>

        <div className="gap-5 grid md:grid-cols-2 lg:grid-cols-4">
          <DashBoardSatsCard
            title="My Investments"
            icon={<FaSackDollar size={25} className="text-primary" />}
          >
            <div>
              <p className="flex items-center font-medium text-primary text-3xl">
                <PiCurrencyInrBold aria-hidden />
                <span className="ml-0.5 tabular-nums">
                  {investedDisplay.replace(/^₹\s*/, "")}
                </span>
              </p>
            </div>
          </DashBoardSatsCard>
          <DashBoardSatsCard
            title="Interest Earned"
            icon={<FaPercent size={18} className="text-primary" />}
          >
            <p className="flex items-center font-medium text-primary text-3xl">
              <PiCurrencyInrBold aria-hidden />
              <span className="ml-0.5 tabular-nums">
                {interestEarnedDisplay.replace(/^₹\s*/, "")}
              </span>
            </p>
          </DashBoardSatsCard>
          <DashBoardSatsCard
            title="My KYC"
            icon={
              <FaUser
                size={19}
                className={
                  kycStatus == "VERIFIED" ? "text-primary" : "text-secondary"
                }
              />
            }
            className={
              kycStatus == "VERIFIED"
                ? undefined
                : "bg-accent text-secondary"
            }
          >
            {kycStatus == "PENDING" && (
              <div className="flex items-end flex-row justify-between gap-2">
                <p className="text-3xl font-medium">
                  {hasKycStarted ? "Pending" : "Not Started"}
                </p>
                <Link href={`/dashboard/kyc`} title={hasKycStarted ? "Complete KYC" : "Start KYC"} aria-label={hasKycStarted ? "Complete KYC" : "Start KYC"}>
                  <Button variant="secondary">
                    {hasKycStarted ? "Complete KYC" : "Start KYC"}
                  </Button>
                </Link>
              </div>
            )}
            {kycStatus == "RE_KYC" && (
              <div className="flex items-end flex-row justify-between gap-2">
                <p className="text-3xl font-medium">Update Required</p>
                <Link href={`/dashboard/kyc`} title="Re KYC" aria-label="Re KYC">
                  <Button variant="secondary">
                    Re KYC
                  </Button>
                </Link>
              </div>
            )}
            {kycStatus == "VERIFIED" && <div className="flex items-end flex-row justify-between gap-2">
              <p className="text-3xl font-medium text-primary">Verified</p>
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
            titleId="dashboard-portfolio-preview-title"
            title={
              <>
                My <span className="text-secondary">Portfolio</span>
              </>
            }
            headerAction={{ href: "/dashboard/portfolio", label: "View All" }}
            isEmpty={portfolioEmpty}
            emptyMessage="No investments available yet"
            ctaText="Explore All Bonds"
            ctaHref="/bonds"
          >
            <DashboardPortfolioDonut
              issuerByType={portfolioIssuer}
              fallbackList={portfolioPreview}
            />
          </DashBoardDataViewCard>

          <DashBoardDataViewCard
            titleId="dashboard-orders-preview-title"
            title={
              <>
                My <span className="text-secondary">Orders</span>
              </>
            }
            headerAction={{ href: "/dashboard/orders", label: "View all orders" }}
            isEmpty={ordersEmpty}
            emptyMessage="No orders found"
            ctaText="Browse bonds"
            ctaHref="/bonds"
          >
            <DashboardOrdersPreview orders={ordersPreview} />
          </DashBoardDataViewCard>
        </div>
        <OngoingDealsCard />
      </div>
    </AccountViewPort>
  );
}

export default DashBoardPage;
