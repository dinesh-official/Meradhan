import CaptchaInput from "@/app/(auth)/signup/_components/CaptchaInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

function ContactForm() {
  return (
    <Card className="min-[1200px]:right-4 min-[1200px]:absolute gap-2 bg-white min-[1200px]:-mt-[110px] mb-14 min-[1200px]:w-[380px]">
      <CardHeader className="pb-0" >
        <CardTitle className="font-normal text-xl quicksand-medium">
          Have any query? Contact us!
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0" >
        <div className="flex flex-col gap-2">
          <Input
            className="bg-muted px-5 py-5.5 border-none rounded-sm"
            placeholder="Your Name"
          />
          <Input
            className="bg-muted px-5 py-5.5 border-none rounded-sm"
            placeholder="Email"
          />
          <Input
            className="bg-muted px-5 py-5.5 border-none rounded-sm"
            placeholder="Phone"
          />
          <Input
            className="bg-muted px-5 py-5.5 border-none rounded-sm"
            placeholder="Enquiry Type"
          />
          <Textarea
            className="bg-muted shadow-none px-5 border-none rounded-sm placeholder:text-gray-500"
            placeholder="Message"
          />
          <CaptchaInput className="" />
        </div>
        <div  className="flex items-center mt-4" >
          <Button className="mx-auto">
            Submit Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContactForm;
