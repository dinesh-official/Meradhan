import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import Link from "next/link";
import { FaBrain, FaCalculator } from "react-icons/fa6";
function ToolsOfferedByMeraDhan() {
  return (
    <SectionWrapper className="bg-accent">
      <div className="container">
        <SectionTitleDesc
          title={
            <>
              <span className="font-semibold text-secondary">Tools</span>{" "}
              Offered by MeraDhan
            </>
          }
        />

        <div className="gap-5 grid lg:grid-cols-2 mt-8">
          <Card className="border-none">
            <CardContent>
              <div className="flex flex-col gap-5">
                <FaBrain size={30} className="text-secondary" />
                <p className="text-2xl quicksand-medium">MeraDhan-GPT</p>
                <p>
                  Meet MeraDhan-GPT—your friendly, AI-powered learning companion for
                  fixed income. It explains concepts, clarifies doubts, and
                  helps you understand bonds at your own pace—in simple Indian
                  English.
                </p>
                <Link href={`/dhangpt`}>
                  <Button variant={"outline"}>Explore</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none">
            <CardContent>
              <div className="flex flex-col gap-5">
                <FaCalculator size={30} className="text-secondary" />
                <p className="text-2xl quicksand-medium">
                  Yield to Maturity Calculator
                </p>
                <p>
                  Curious about how bond returns are calculated? Use our Yield
                  to Maturity (YTM) calculator to explore how bond returns are
                  measured—no login required, no complex steps.
                </p>

                <div className="flex justify-start">
                  <Button variant={"outline"}>
                    <Link href={`/ytm-calculator`}>
                      Calculate YTM
                    </Link>
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionWrapper>
  );
}

export default ToolsOfferedByMeraDhan;
