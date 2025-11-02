"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GetCustomerResponseById } from "@root/apiGateway";
import React from "react";
import NeedKyc from "./_components/NeedKyc";
import { ProfileTabs } from "./_components/ProfileTab";
import ProfileViewCard from "./_components/ProfileViewCard";
import PersonalDetails from "./_components/Tabs/PersonalDetails";
const tabs = [
  "Personal Details",
  "Bank Accounts",
  "Demat Accounts",
  "Risk Profile",
  "My Watch List",
  // "Refer & Earn",
];
function ProfilePage({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
}) {
  const [activeTab, setActiveTab] = React.useState(0);
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
            <NeedKyc
              key={2}
              title={`No bank accounts found!`}
              desc={`to add bank accounts!`}
            />,
            <NeedKyc
              key={3}
              title={`No demat accounts found!`}
              desc={`to add demat accounts!`}
            />,
            <NeedKyc
              key={4}
              title={`No risk profile found!`}
              desc={`to add risk profile!`}
            />,
            <NeedKyc
              key={5}
              title={`No watch list found!`}
              href="/bonds"
              buttonText="Explore List of Active Bonds"
              desc={`to add watch list!`}
            />,
          ][activeTab]
        }
      </CardContent>
    </Card>
  );
}

export default ProfilePage;
