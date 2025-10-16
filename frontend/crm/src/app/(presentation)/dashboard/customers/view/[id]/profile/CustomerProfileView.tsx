import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { IdCardIcon, NotebookPen } from "lucide-react";

function CustomerProfileView() {
  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        showBack
        title="Customer Profile"
        description="Complete customer information and account details"
        actions={
          <div className="gap-3 flex  justify-center items-center md:w-auto w-full">
            <Button variant={`outline`}>
              <IdCardIcon /> View KYC Data
            </Button>
            <Button variant={`default`}>
              <NotebookPen /> View RFQs
            </Button>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Customer Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <b className="text-xs block mb-4">Basic Information</b>
          <div className="grid xl:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-5 mb-4">
            <LabelView title="Full Name">
              <p>Working Bapari</p>
            </LabelView>
            <LabelView title="First Name">
              <p>Working Bapari</p>
            </LabelView>
            <LabelView title="Middle Name">
              <p>Working Bapari</p>
            </LabelView>
            <LabelView title="Last Name">
              <p>Working Bapari</p>
            </LabelView>
            <LabelView title="User Type">
              <p>Working Bapari</p>
            </LabelView>
          </div>
          <b className="text-xs block mb-4 mt-7">Contact Information</b>
          <div className="grid xl:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-5 mb-4">
            <LabelView title="Email ID">
              <p>Working Bapari</p>
            </LabelView>
            <LabelView title="Mobile Number">
              <p>Working Bapari</p>
              <StatusBadge value={"Not Verified"} />
            </LabelView>
            <LabelView title="WhatsApp Number">
              <p>Working Bapari</p>
              <StatusBadge value={"Verified"} />
            </LabelView>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid xl:grid-cols-4 grid-cols-2  gap-5 mb-4">
              <LabelView title="Account Status">
                <StatusBadge value={"Verified"} />
              </LabelView>
              <LabelView title="KYC Status">
                <StatusBadge value={"Pending"} />
              </LabelView>
              <LabelView title="Terms Accepted">
                <StatusBadge value={"Yes"} />
              </LabelView>
              <LabelView title="WhatsApp Notifications">
                <StatusBadge value={"Enabled"} />
              </LabelView>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3 gap-5">
              <LabelView title="Account Created">
                <p>July 1st, 2025</p>
              </LabelView>
              <LabelView title="KYC Status">
                <p>September 22nd, 2025</p>
              </LabelView>
              <LabelView title="Customer ID">
                <p>#dlfcgcw0mdqxybgeiysnwlxa</p>
              </LabelView>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CustomerProfileView;
