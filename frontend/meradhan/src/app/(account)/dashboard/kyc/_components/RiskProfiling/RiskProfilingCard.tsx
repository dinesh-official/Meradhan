import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { MdOutlineArrowRight } from "react-icons/md";
import RiskProfilingSelector from "./RiskProfilingSelector";

function RiskProfilingCard() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Investment Experience</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <RiskProfilingSelector />
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button className="w-full sm:w-auto">
          Save & Continue <MdOutlineArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RiskProfilingCard;
