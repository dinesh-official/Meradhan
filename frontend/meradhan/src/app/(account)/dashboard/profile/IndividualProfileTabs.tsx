"use client";

import { GetCustomerResponseById } from "@root/apiGateway";
import React from "react";
import NeedKyc from "./_components/NeedKyc";
import { ProfileTabs } from "./_components/ProfileTab";
import PersonalDetails from "./_components/Tabs/PersonalDetails";
import BankAccounts from "./_components/Tabs/BankAccounts";
import DematAccounts from "./_components/Tabs/DematAccounts";
import RiskProfiling from "./_components/Tabs/RiskProfile";
import WatchList from "./_components/Tabs/WatchList";
import {
  canAccessKycSections,
  canEditKycSections,
} from "./_utils/profileKyc";

const tabs = [
  "Personal Details",
  "Bank Accounts",
  "Demat Accounts",
  "Risk Profile",
  "My Watchlist",
];

export default function IndividualProfileTabs({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
}) {
  const [activeTab, setActiveTab] = React.useState(0);
  const kycAccessible = canAccessKycSections(profile.kycStatus);
  const kycEditable = canEditKycSections(profile.kycStatus);

  return (
    <>
      <div className="top-16 md:top-18 z-40 sticky bg-white mt-4 lg:mt-2">
        <ProfileTabs
          active={tabs[activeTab]}
          onChange={(_tab, idx) => setActiveTab(idx)}
          tabs={tabs}
        />
      </div>
      {
        [
          <PersonalDetails profile={profile} key={1} />,
          kycAccessible ? (
            <BankAccounts
              profile={profile}
              key={2}
              allowAddNew={kycEditable}
            />
          ) : (
            <NeedKyc
              key={2}
              title="No bank accounts found!"
              desc="to add bank accounts!"
            />
          ),
          kycAccessible ? (
            <DematAccounts
              profile={profile}
              key={3}
              allowAddNew={kycEditable}
            />
          ) : (
            <NeedKyc
              key={3}
              title="No demat accounts found!"
              desc="to add demat accounts!"
            />
          ),
          kycAccessible ? (
            <RiskProfiling profile={profile} key={4} allowSave={kycEditable} />
          ) : (
            <NeedKyc
              key={4}
              title="No risk profile found!"
              desc="to add risk profile!"
            />
          ),
          <WatchList key={5} />,
        ][activeTab]
      }
    </>
  );
}
