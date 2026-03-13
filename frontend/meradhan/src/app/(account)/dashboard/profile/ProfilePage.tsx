"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import apiGateway, { GetCustomerResponseById } from "@root/apiGateway";
import React from "react";
import NeedKyc from "./_components/NeedKyc";
import { ProfileTabs } from "./_components/ProfileTab";
import ProfileViewCard from "./_components/ProfileViewCard";
import PersonalDetails from "./_components/Tabs/PersonalDetails";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import BankAccounts from "./_components/Tabs/BankAccounts";
import DematAccounts from "./_components/Tabs/DematAccounts";
import RiskProfiling from "./_components/Tabs/RiskProfile";
import WatchList from "./_components/Tabs/WatchList";
const tabs = [
  "Personal Details",
  "Bank Accounts",
  "Demat Accounts",
  "Risk Profile",
  "My Watchlist",
  // "Refer & Earn",
];
function ProfilePage({
  profileData,
}: {
  profileData: GetCustomerResponseById["responseData"];
}) {
  const [activeTab, setActiveTab] = React.useState(0);
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller
  );
  const { data: profile } = useQuery({
    queryKey: ["profile-page", profileData.id],
    initialData: profileData,
    queryFn: async () => {
      const userData = await customerApi.customerInfoById(
        Number(profileData.id)
      );
      return userData.data.responseData;
    },
  });

  return (
    <Card accountMode className="relative gap-0">
      <CardHeader accountMode>
        <ProfileViewCard profile={profile} />
      </CardHeader>
      <CardContent accountMode>
        <div className="top-16 md:top-18 z-40 sticky bg-white mt-4 lg:mt-2">
          <ProfileTabs
            active={tabs[activeTab]}
            onChange={(tab, idx) => {
              setActiveTab(idx);
            }}
            tabs={tabs}
          />
        </div>
        {
          [
            <PersonalDetails profile={profile} key={1} />,
            profile.kycStatus == "VERIFIED" ||
            profile.kycStatus == "RE_KYC" ||
            profile.kycStatus == "UNDER_REVIEW" ? (
              <BankAccounts
                profile={profile}
                key={2}
                allowAddNew={profile.kycStatus == "VERIFIED"}
              />
            ) : (
              <NeedKyc
                key={2}
                title={`No bank accounts found!`}
                desc={`to add bank accounts!`}
              />
            ),
            profile.kycStatus == "VERIFIED" ||
            profile.kycStatus == "RE_KYC" ||
            profile.kycStatus == "UNDER_REVIEW" ? (
              <DematAccounts
                profile={profile}
                key={3}
                allowAddNew={profile.kycStatus == "VERIFIED"}
              />
            ) : (
              <NeedKyc
                key={3}
                title={`No demat accounts found!`}
                desc={`to add demat accounts!`}
              />
            ),
            profile.kycStatus == "VERIFIED" ||
            profile.kycStatus == "RE_KYC" ||
            profile.kycStatus == "UNDER_REVIEW" ? (
              <RiskProfiling
                profile={profile}
                key={4}
                allowSave={profile.kycStatus == "VERIFIED"}
              />
            ) : (
              <NeedKyc
                key={4}
                title={`No risk profile found!`}
                desc={`to add risk profile!`}
              />
            ),
            <WatchList key={5} />,
          ][activeTab]
        }
      </CardContent>
    </Card>
  );
}

export default ProfilePage;
