import LabelView from "@/global/elements/wrapper/LabelView";
import React from "react";

function AddressCard() {
  return (
    <div className="flex flex-col gap-5">
      <LabelView title="Line 1">
        <p className="font-medium text-sm">C/O Surender Pal Kukreja, House N0 4/7</p>
      </LabelView>
      <LabelView title="Line 2">
        <p className="font-medium text-sm">
          Oppositr Old Water Tank Shiv Mandir Ward Gadarpur, Post Office
          Gadarpur Tehsil, Gadarpur
        </p>
      </LabelView>
      <LabelView title="Line 3">
        <p className="font-medium text-sm">
          Gadarpura, Udham Singh Nagar, Uttarakhand, 263152
        </p>
      </LabelView>

      <div className="grid lg:grid-cols-5 grid-cols-2 gap-5">
        <LabelView title="Locality or Post Office">
          <p className="font-medium text-sm">Gadarpura</p>
        </LabelView>
        <LabelView title="City or District">
          <p className="font-medium text-sm">Udham Singh Nagar</p>
        </LabelView>
        <LabelView title="State">
          <p className="font-medium text-sm">Uttarakhand</p>
        </LabelView>
        <LabelView title="Pincode">
          <p className="font-medium text-sm">263152</p>
        </LabelView>
        <LabelView title="Country">
          <p className="font-medium text-sm">India</p>
        </LabelView>
      </div>
      <LabelView title="Full Address">
        <p className="font-medium text-sm">
          C/O Surender Pal Kukreja,House N0 4/7,Oppositr Old Water Tank Shiv
          Mandir Ward Gadarpur,Post Office Gadarpur
          Tehsil,Gadarpur,Gadarpura,Udham Singh Nagar,Uttarakhand,263152
        </p>
      </LabelView>
    </div>
  );
}

export default AddressCard;
