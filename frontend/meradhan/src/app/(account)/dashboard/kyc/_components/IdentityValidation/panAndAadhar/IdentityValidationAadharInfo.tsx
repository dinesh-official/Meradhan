import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MdOutlineArrowRight } from "react-icons/md";

function IdentityValidationAadharInfo() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">
          Confirm Aadhar & Address Details
        </CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="gap-10 grid lg:grid-cols-5">
          <div className="flex flex-col gap-5 col-span-2">
            <DataInfoLabel
              title="Aadhar Number (last 4-digits)"
              status="SUCCESS"
              statusLabel="Fetched"
              showStatus
            >
              <p className="font-medium">XXXX-XXXX-5868</p>
            </DataInfoLabel>
            <DataInfoLabel
              title="Name"
              status="SUCCESS"
              statusLabel="Verified"
              showStatus
            >
              <p className="font-medium">VIKAS KUKREJA</p>
            </DataInfoLabel>
            <DataInfoLabel
              title="Address"
              status="SUCCESS"
              statusLabel="Fetched"
              showStatus
              subtext={
                <>
                  <p className="text-gray-500 text-xs">
                    (will be used for future communications)
                  </p>
                </>
              }
            >
              <p className="font-medium">
                House N0 4/7 Oppositr Old Water Tank Shiv Mandir Ward Gadarpur
                Post Office Gadarpur Tehsil Gadarpur Udham Singh Nagar
                Uttarakhand 263152 India
              </p>
            </DataInfoLabel>
          </div>
          <div className="col-span-3">
            <div className="bg-gray-200 rounded-2xl w-full h-80"></div>
          </div>
        </div>
        <div className="gap-5 grid md:grid-cols-3 md:mt-10 py-5 border-gray-200 md:border-t md:border-b">
          <DataInfoLabel title="City">
            <p className="font-medium">Gadarpur</p>
          </DataInfoLabel>
          <DataInfoLabel title="State">
            <p className="font-medium">Uttarakhand</p>
          </DataInfoLabel>
          <DataInfoLabel title="Pincode">
            <p className="font-medium">263152</p>
          </DataInfoLabel>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button className="w-full sm:w-auto">
          Continue To verify <MdOutlineArrowRight />
        </Button>
        <Button variant={`link`}>Save & Exit</Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationAadharInfo;
