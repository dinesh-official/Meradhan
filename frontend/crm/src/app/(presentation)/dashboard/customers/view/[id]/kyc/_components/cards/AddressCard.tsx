import LabelView from "@/global/elements/wrapper/LabelView";
import React from "react";

export interface AddressCardDataProp {
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  postOffice: string;
  district: string;
  stateName: string;
  pinCode: string;
  country: string;
  fullAddress: string;
}

function AddressCard(addressData: AddressCardDataProp) {
  return (
    <div className="flex flex-col gap-5">
      <LabelView title="Line 1">
        <p className="font-medium text-sm">{addressData.addressLine1}</p>
      </LabelView>
      {addressData.addressLine2 && (
        <LabelView title="Line 2">
          <p className="font-medium text-sm">{addressData.addressLine2}</p>
        </LabelView>
      )}

      {addressData.addressLine3 && (
        <LabelView title="Line 3">
          <p className="font-medium text-sm">{addressData.addressLine3}</p>
        </LabelView>
      )}

      <div className="grid lg:grid-cols-5 grid-cols-2 gap-5">
        <LabelView title="Locality or Post Office">
          <p className="font-medium text-sm">{addressData.postOffice}</p>
        </LabelView>
        <LabelView title="City or District">
          <p className="font-medium text-sm">{addressData.district}</p>
        </LabelView>
        <LabelView title="State">
          <p className="font-medium text-sm">{addressData.stateName}</p>
        </LabelView>
        <LabelView title="PinCode">
          <p className="font-medium text-sm">{addressData.pinCode}</p>
        </LabelView>
        <LabelView title="Country">
          <p className="font-medium text-sm">{addressData.country}</p>
        </LabelView>
      </div>
      <LabelView title="Full Address">
        <p className="font-medium text-sm">{addressData.fullAddress}</p>
      </LabelView>
    </div>
  );
}

export default AddressCard;
