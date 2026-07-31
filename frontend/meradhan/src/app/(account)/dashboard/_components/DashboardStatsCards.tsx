"use client";

import { Button } from "@/components/ui/button";
import { DashBoardSatsCard } from "@/app/(account)/dashboard/_components/_cards/DashBoardSatsCard";
import Link from "next/link";
import { FaPercent, FaTag, FaUser } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { PiCurrencyInrBold } from "react-icons/pi";

type KycStatus = string | null | undefined;

export default function DashboardStatsCards({
  investedDisplay,
  interestEarnedDisplay,
  kycStatus,
  hasKycStarted,
}: {
  investedDisplay: string;
  interestEarnedDisplay: string;
  kycStatus: KycStatus;
  hasKycStarted: boolean;
}) {
  return (
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
          kycStatus == "VERIFIED" ? undefined : "bg-accent text-secondary"
        }
      >
        {kycStatus == "PENDING" && (
          <div className="flex items-end flex-row justify-between gap-2">
            <p className="text-3xl font-medium">
              {hasKycStarted ? "Pending" : "Not Started"}
            </p>
            <Link href={`/dashboard/kyc`}>
              <Button variant="secondary">
                {hasKycStarted ? "Complete KYC" : "Start KYC"}
              </Button>
            </Link>
          </div>
        )}
        {kycStatus == "RE_KYC" && (
          <div className="flex items-end flex-row justify-between gap-2">
            <p className="text-3xl font-medium">Update Required</p>
            <Link href={`/dashboard/kyc`}>
              <Button variant="secondary">Re KYC</Button>
            </Link>
          </div>
        )}
        {kycStatus == "VERIFIED" && (
          <div className="flex items-end flex-row justify-between gap-2">
            <p className="text-3xl font-medium text-primary">Verified</p>
          </div>
        )}
        {kycStatus == "UNDER_REVIEW" && (
          <div className="flex items-end flex-row justify-between gap-2">
            <p className="text-3xl font-medium">Under Review</p>
          </div>
        )}
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
  );
}
