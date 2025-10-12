"use client";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import ViewKycDataComponent from "./_components/ViewKycDataComponent";

function CustomerKycView() {
  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="KYC Data - Vikas Kukreja"
        description="Comprehensive KYC information and document verification status"
        showBack
      />

      <ViewKycDataComponent />
    </div>
  );
}

export default CustomerKycView;
