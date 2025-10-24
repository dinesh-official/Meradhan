import { Card } from "@/components/ui/card";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import { FaCircleCheck } from "react-icons/fa6";
import SignUpForm from "../_components/SignUpForm";

function page() {
  return (
    <ViewPort headerOnly>
      <div className="bg-muted md:min-h-[calc(100vh-72px)]  min-h-[calc(100vh-64px)] flex justify-center items-center py-10">
        <div className="container">
          <Card className="w-full border-0 grid lg:grid-cols-2 p-0 overflow-hidden">
            <SignUpForm />
            <div className="bg-primary flex justify-center flex-col gap-3 items-start w-full h-full  lg:p-20 p-10">
              <h5
                className={cn(
                  "text-2xl text-white font-medium",
                  quicksand.className
                )}
              >
                Reasons to choose MeraDhan
              </h5>
              <ul className="text-white text-sm flex flex-col gap-4 mt-2">
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
