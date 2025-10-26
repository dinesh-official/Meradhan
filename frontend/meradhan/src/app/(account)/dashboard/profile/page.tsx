import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DataInfoLabel from "../../_components/cards/DataInfoLabel";
import AccountViewPort from "../../_components/wrapper/AccountViewPort";
import { ProfileTabs } from "./_components/ProfileTab";
import ProfileViewCard from "./_components/ProfileViewCard";

function page() {
  return (
    <AccountViewPort
      title={
        <>
          My <span className="font-bold">Profile</span>
        </>
      }
    >
      <Card className="border-gray-200">
        <CardHeader>
          <ProfileViewCard />
          <ProfileTabs
            active={`Personal Details`}
            tabs={[
              "Personal Details",
              "Bank Accounts",
              "Demat Accounts",
              "Risk Profile",
              "My Watch List",
              "Refer & Earn",
            ]}
          />
        </CardHeader>
        <CardContent>
          <div className="gap-5 grid md:grid-cols-3">
            <DataInfoLabel title="First Name">
              <p className="font-medium">Sourav</p>
            </DataInfoLabel>
            <DataInfoLabel title="Middle Name">
              <p className="font-medium">--</p>
            </DataInfoLabel>
            <DataInfoLabel title="Last Name">
              <p className="font-medium">Bapari</p>
            </DataInfoLabel>

            <DataInfoLabel title="Mobile" status={"ERROR"} showStatus>
              <p className="font-medium">+91 9382156026</p>
            </DataInfoLabel>
            <DataInfoLabel title="Email">
              <p className="font-medium">adarsh@meradhan.co</p>
            </DataInfoLabel>
            <DataInfoLabel title="WhatsApp Notification ">
              <p className="font-medium">Allow Notification</p>
            </DataInfoLabel>
          </div>
          <div className="gap-5 grid md:grid-cols-3 mt-6 pt-6 border-gray-200 border-t">
            <DataInfoLabel title="Line 1" className="md:col-span-3">
              <p className="font-medium">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Officia ipsa corrupti aut excepturi cum totam{" "}
              </p>
            </DataInfoLabel>
            <DataInfoLabel title="Line 2" className="md:col-span-3">
              <p className="font-medium">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.{" "}
              </p>
            </DataInfoLabel>
            <DataInfoLabel title="Line 3" className="md:col-span-3">
              <p className="font-medium">--</p>
            </DataInfoLabel>
            <DataInfoLabel title="City / Town / Village">
              <p className="font-medium">Kolkata</p>
            </DataInfoLabel>

            <DataInfoLabel title="District">
              <p className="font-medium">Bankura</p>
            </DataInfoLabel>
            <DataInfoLabel title="State">
              <p className="font-medium">West Bengal</p>
            </DataInfoLabel>
            <DataInfoLabel title="Pincode ">
              <p className="font-medium">722141</p>
            </DataInfoLabel>
            <DataInfoLabel title="Country ">
              <p className="font-medium">India</p>
            </DataInfoLabel>
          </div>
        </CardContent>
      </Card>
    </AccountViewPort>
  );
}

export default page;
