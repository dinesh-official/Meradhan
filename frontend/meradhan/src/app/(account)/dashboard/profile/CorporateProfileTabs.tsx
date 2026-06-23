"use client";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { GetCustomerResponseById } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import NeedKyc from "./_components/NeedKyc";
import { ProfileTabs } from "./_components/ProfileTab";
import BankAccounts from "./_components/Tabs/BankAccounts";
import DematAccounts from "./_components/Tabs/DematAccounts";
import WatchList from "./_components/Tabs/WatchList";
import CompanyDetails from "./_components/Tabs/corporate/CompanyDetails";
import RelatedPersonDetails from "./_components/Tabs/corporate/RelatedPersonDetails";
import CorporateRiskProfile from "./_components/Tabs/corporate/CorporateRiskProfile";
import {
  canAccessKycSections,
  canEditKycSections,
} from "./_utils/profileKyc";

const tabs = [
  "Company Details",
  "Bank Accounts",
  "Demat Accounts",
  "Related Person",
  "Risk Profile",
  "My Watchlist",
];

export default function CorporateProfileTabs({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
}) {
  const [activeTab, setActiveTab] = React.useState(0);
  const kycAccessible = canAccessKycSections(profile.kycStatus);
  const kycEditable = canEditKycSections(profile.kycStatus);

  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller,
  );

  const { data: corporateKyc } = useQuery({
    queryKey: ["corporate-kyc-profile", profile.id],
    queryFn: async () => {
      const res = await customerApi.getCorporateKyc(profile.id);
      return res.data.responseData;
    },
    enabled: profile.userType === "CORPORATE",
  });

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
          <CompanyDetails
            profile={profile}
            corporateKyc={corporateKyc}
            key={1}
          />,
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
          <RelatedPersonDetails
            corporateKyc={corporateKyc}
            kycStatus={profile.kycStatus}
            key={4}
          />,
          kycAccessible ? (
            <CorporateRiskProfile
              profile={profile}
              key={5}
              allowSave={kycEditable}
            />
          ) : (
            <NeedKyc
              key={5}
              title="No risk profile found!"
              desc="to add risk profile!"
            />
          ),
          <WatchList key={6} />,
        ][activeTab]
      }
    </>
  );
}
