"use client";

import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { ManualKycForm } from "./_components/ManualKycForm";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ManualKycPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId")
    ? Number(searchParams.get("customerId"))
    : undefined;

  const handleSuccess = () => {
    toast.success("KYC data submitted successfully");
    router.push("/dashboard/customers");
  };

  return (
    <div className="space-y-6">
      <PageInfoBar
        title="Manual KYC Entry"
        description="Enter mandatory KYC information for regulatory compliance. All fields are required."
        showBack
      />

      <div className="max-w-4xl mx-auto">
        <ManualKycForm customerId={customerId} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

