import DataInfoLabel from '@/app/(account)/_components/cards/DataInfoLabel'
import { GetCustomerResponseById } from '@root/apiGateway'
import React from 'react'

function PersonalDetails({ profile }: { profile: GetCustomerResponseById['responseData'] }) {
  return (
      <>
        <div className="gap-5 grid md:grid-cols-3 mt-5">
          <DataInfoLabel title="First Name">
            <p className="text-sm">{profile.firstName}</p>
          </DataInfoLabel>
          <DataInfoLabel title="Middle Name">
            <p className="text-sm">{profile.middleName || "--"}</p>
          </DataInfoLabel>
          <DataInfoLabel title="Last Name">
            <p className="text-sm">{profile.lastName || "--"}</p>
          </DataInfoLabel>

          <DataInfoLabel title="Mobile" status={"SUCCESS"} showStatus>
            <p className="text-sm">{profile.phoneNo || "--"}</p>
          </DataInfoLabel>
          <DataInfoLabel title="Email">
            <p className="text-sm">{profile.emailAddress || "--"}</p>
          </DataInfoLabel>
          <DataInfoLabel title="WhatsApp Notification ">
            <p className="text-sm">
              {profile.utility.whatsAppNotificationAllow
                ? "Allow Notification"
                : "Disable Notification"}
            </p>
          </DataInfoLabel>
        </div>
        <div className="gap-5 grid md:grid-cols-3 mt-6 pt-6 border-gray-200 border-t">
          <DataInfoLabel title="Line 1" className="md:col-span-3">
            <p className="text-sm">--</p>
          </DataInfoLabel>
          <DataInfoLabel title="Line 2" className="md:col-span-3">
            <p className="text-sm">--</p>
          </DataInfoLabel>
          <DataInfoLabel title="Line 3" className="md:col-span-3">
            <p className="text-sm">--</p>
          </DataInfoLabel>
          <DataInfoLabel title="City / Town / Village">
            <p className="text-sm">--</p>
          </DataInfoLabel>

          <DataInfoLabel title="District">
            <p className="text-sm">--</p>
          </DataInfoLabel>
          <DataInfoLabel title="State">
            <p className="text-sm">--</p>
          </DataInfoLabel>
          <DataInfoLabel title="Pincode ">
            <p className="text-sm">--</p>
          </DataInfoLabel>
          <DataInfoLabel title="Country ">
            <p className="text-sm">India</p>
          </DataInfoLabel>
        </div>
      </>
  )
}

export default PersonalDetails