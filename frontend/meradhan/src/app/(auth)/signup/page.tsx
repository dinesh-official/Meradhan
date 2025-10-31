import { Card } from "@/components/ui/card";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { cn } from "@/lib/utils";
import { FaCircleCheck } from "react-icons/fa6";
import SignUpForm from "./SignUpForm";

function page() {
  return (
    <ViewPort headerOnly>
      <div className="flex justify-center items-center bg-muted py-10 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)]">
        <div className="container">
          <Card className="grid lg:grid-cols-2 p-0 border-0 w-full overflow-hidden">
            <SignUpForm />
            <div className="flex flex-col justify-center items-start gap-3 bg-primary p-10 lg:p-20 w-full h-full">
              <h5
                className={cn(
                  "quicksand-medium  text-white text-2xl"
                )}
              >
                Reasons to choose MeraDhan
              </h5>
              <ul className="flex flex-col gap-4 mt-2 text-white text-sm">
                <li className="flex items-center gap-3">
                  <FaCircleCheck size={18} className="text-secondary" /> Easy
                  Guides & Articles
                </li>
                <li className="flex items-center gap-3">
                  <FaCircleCheck size={18} className="text-secondary" />{" "}
                  Friendly Interface & Visuals
                </li>
                <li className="flex items-center gap-3">
                  <FaCircleCheck size={18} className="text-secondary" />{" "}
                  Exclusive Learning & Webinars
                </li>
                <li className="flex items-center gap-3">
                  <FaCircleCheck size={18} className="text-secondary" /> Led by
                  Industry Experts
                </li>
                <li className="flex items-center gap-3">
                  <FaCircleCheck size={18} className="text-secondary" />{" "}
                  AI-Powered Learning Support
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
