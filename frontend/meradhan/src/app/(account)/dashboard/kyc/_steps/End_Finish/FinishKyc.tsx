import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway from "@root/apiGateway";

import { useQuery } from "@tanstack/react-query";
import { FaCheckSquare, FaDownload } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import { genMediaUrl } from "@/global/utils/url.utils";
import { Loader2 } from "lucide-react";

function FinishKyc() {

  const apiClient = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const { cookies } = useAppCookie();
  const { state } = useKycDataStorage();


  const profileData = useQuery({
    queryKey: ["getProfileDataForKyc"],
    queryFn: async () => {
      const response = await apiClient.customerInfoById(cookies.userId || "");
      return response.data.responseData;
    },
  });


  if (profileData.isLoading) {
    return <div className="flex justify-center items-center h-96">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  }

  return (
    <Card accountMode>
      <CardContent accountMode>
        {(profileData.data?.kycStatus != "VERIFIED") && <div className="flex flex-col justify-center items-center gap-3 py-10 text-center">
          <FaCheckSquare size={50} className="text-green-600" />
          <p className="font-normal text-lg">KYC Form Submitted</p>
          <p className="flex justify-center items-center gap-4" >
            Registration on Exchange Platform{" "}
            <span className="bg-amber-100 px-4 py-1.5 rounded-md">Pending</span>{" "}
          </p>
          <p className="max-w-[600px]">
            Your KYC details have been submitted to the respective exchanges.
            The verification process may take up to two (2) business days. An
            email confirmation will be sent to your registered email address
            upon completion of the verification.
          </p>
          <div className="mt-3">
            <Button size={`lg`}>
              Explore Products  <div className="flex justify-center items-center p-0 h-full">
                <IoMdArrowDropright className="p-0 text-4xl" />
              </div>
            </Button>
          </div>
        </div>}

        {(profileData.data?.kycStatus == "VERIFIED") && <div className="flex flex-col justify-center items-center gap-3 py-10 text-center">
          <FaCheckSquare size={50} className="text-green-600" />
          <p className="font-normal text-lg">KYC Verified</p>
          <p className="flex justify-center items-center gap-4" >
            Your KYC verification is complete. You can now invest in bonds seamlessly on MeraDhan.
          </p>
          <Button size={`lg`} variant={`defaultLight`} onClick={() => {
            window.open(genMediaUrl(state.step_6.response?.fileUrl || ""), "_blank");
          }}>
            Download KYC Copy <FaDownload />
          </Button>
        </div>}
      </CardContent>
    </Card>
  );
}

export default FinishKyc;
