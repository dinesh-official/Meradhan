import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";

import { FaCheckSquare } from "react-icons/fa";
import { MdOutlineArrowRight } from "react-icons/md";

function FinishKyc() {
    
  return (
    <Card accountMode>
      <CardContent accountMode>
        <div className="flex flex-col justify-center items-center gap-3 py-10 text-center">
          <FaCheckSquare size={60} className="text-green-600" />
          <p className="font-medium text-lg">KYC Form Submitted</p>
          <p>
            Registration on Exchange Platform{" "}
            <span className="bg-amber-100 px-4 py-1.5 rounded-lg">Pending</span>{" "}
          </p>
          <p className="max-w-[600px]">
            Your KYC details have been submitted to the respective exchanges.
            The verification process may take up to two (2) business days. An
            email confirmation will be sent to your registered email address
            upon completion of the verification.
          </p>
          <div className="mt-3">
            <Button size={`lg`}>
              Explore Products <MdOutlineArrowRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FinishKyc;
