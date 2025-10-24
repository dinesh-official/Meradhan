import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import React from "react";
import { FaBrain } from "react-icons/fa6";
import { FaCalculator } from "react-icons/fa6";
function ToolsOfferedByMeraDhan() {
  return (
    <div className="bg-accent py-14">
      <div className="container">
        <h3
          className={cn(
            "text-center lg:text-3xl  text-2xl  font-medium",
            quicksand.className
          )}
        >
          <span className="text-secondary font-semibold">Tools</span> Offered by
          MeraDhan
        </h3>
        <div className="grid lg:grid-cols-2 gap-5 mt-8">
          <Card className="border-none">
            <CardContent>
              <div className="flex flex-col gap-5">
                <FaBrain size={30} className="text-secondary" />
                <p className="text-2xl">DhanGPT</p>
                <p>
                  Meet DhanGPT—your friendly, AI-powered learning companion for
                  fixed income. It explains concepts, clarifies doubts, and
                  helps you understand bonds at your own pace—in simple Indian
                  English.
                </p>
                <div>
                  <Button variant={"outline"}>Coming Soon</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none">
            <CardContent>
              <div className="flex flex-col gap-5">
                <FaCalculator size={30} className="text-secondary" />
                <p className="text-2xl">Yield to Maturity Calculator</p>
                <p>
                  Curious about how bond returns are calculated? Use our Yield
                  to Maturity (YTM) calculator to explore how bond returns are
                  measured—no login required, no complex steps.
                </p>
                <div>
                  <Button variant={"outline"}>Coming Soon</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ToolsOfferedByMeraDhan;
