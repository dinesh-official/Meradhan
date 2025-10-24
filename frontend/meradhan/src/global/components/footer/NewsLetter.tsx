import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

function NewsLetter() {
  return (
    <div className="bg-secondary py-12">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="text-white">
            <h3 className="text-2xl ">Stay up-to-date with market updates!</h3>
            <p>Stay up-to-date with market updates!</p>
          </div>
          <div className="flex flex-col justify-center gap-2 lg:items-end text-white">
            <div className="flex md:flex-row flex-col gap-5 ">
              <Input
                className="bg-white border-0 lg:w-96 w-full lg:py-3 py-5 text-gray-900"
                placeholder="Your Email ID"
              />
              <Button variant={`outlineLight`} className="px-8">
                Subscribe
              </Button>
            </div>
            <p className="text-xs">
              By clicking on “Subscribe” button, I agree to MeraDhan’s Privacy
              Policy and Terms of Use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsLetter;
