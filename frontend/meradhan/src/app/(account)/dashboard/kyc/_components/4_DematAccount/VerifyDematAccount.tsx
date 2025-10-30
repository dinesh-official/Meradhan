import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { AiFillPlusSquare } from "react-icons/ai";
import { MdOutlineArrowRight } from "react-icons/md";
import DematAccountView from "./elements/DematAccountView";

function VerifyDematAccount() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Verify Demat Account</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <DematAccountView />
        <DematAccountView />
        <DematAccountView />
      </CardContent>
      <CardFooter
        accountMode
        className="flex sm:flex-row flex-col-reverse justify-center sm:justify-between items-center gap-5 sm:text-left text-center"
      >
        <div className="flex sm:flex-row flex-col gap-5 w-full">
          <Button className="w-full sm:w-auto">
            Confirm & Continue <MdOutlineArrowRight />
          </Button>
          <Button variant={`link`}>Save & Exit</Button>
        </div>
        <Button variant={`link`}>
          <AiFillPlusSquare className="text-secondary text-xl" />
          Add Demat Account{" "}
          <span className="text-gray-500 text-xs">(max 5 accounts)</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default VerifyDematAccount;
