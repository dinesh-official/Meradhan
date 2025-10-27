import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FaDownload } from "react-icons/fa";
import { MdOutlineArrowRight } from "react-icons/md";

function KycESign() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Kyc Form Generation</CardTitle>
        <CardDescription>
          KYC form generated successfully. Download the form and review it
          before you proceed to e-sign.
        </CardDescription>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex flex-col gap-3" >
          <Button
            size={`lg`}
            variant={`defaultLight`}
            className="gap-5 w-56 font-medium"
          >
            Download KYC Form <FaDownload />{" "}
          </Button>
          <p className="font-medium text-lg">Final Step - Proceed to e-Sign</p>
          <p>
            You’re almost there! Please agree to the following terms to proceed
            to e-Sign.
          </p>

          <p className="flex items-center gap-2">
            <Checkbox />
            By continue, I agree to the following terms:
          </p>
          <ul className="flex flex-col gap-1 ml-10 list-disc">
            <li>
              I hereby authorize MeraDhan to use my Aadhaar / Virtual ID details
              (as applicable) solely for the purpose of e-Signing my KYC /
              Re-KYC registration.
            </li>
            <li>
              I hereby authorize MeraDhan to share my information with NSE / BSE
              for the facilitation of bond trading.
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button className="w-full sm:w-auto">
          Proceed to E-Sign <MdOutlineArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default KycESign;
