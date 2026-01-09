"use client";
import CaptchaInput from "@/app/(auth)/signup/_components/CaptchaInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { zodResolver } from "@hookform/resolvers/zod";
import apiGateway from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import ContactInput from "./ContactInput";
import Swal from "sweetalert2";

type ContactFormValues = z.infer<typeof appSchema.contact.contactSchema>;
const contactSchema = appSchema.contact
  .contactSchema as unknown as z.ZodType<ContactFormValues>;
function ContactForm() {
  // Cast to align mixed zod versions between appSchema and resolver
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contactResolver = (zodResolver as unknown as any)(
    contactSchema as unknown
  ) as import("react-hook-form").Resolver<ContactFormValues>;
  const {
    watch,
    setValue,
    formState: { errors },
    setError,
    handleSubmit,
    reset,
  } = useForm<ContactFormValues>({
    defaultValues: {
      email: "",
      enquiryType: "general",
      fullName: "",
      message: "",
      phone: "",
    },
    resolver: contactResolver,
  });

  const apiClient = new apiGateway.meradhan.commonApi.CommonApi(
    apiClientCaller
  );

  const submitFormMutation = useMutation({
    mutationKey: ["contact_submit"],
    mutationFn: async (payload: ContactFormValues) => {
      return await apiClient.conntactSubmit(payload);
    },
    onSuccess: () => {
      Swal.fire({
        imageUrl: "/images/icons/ok.png",
        title: "Message sent",
        text: "your message send successfully",
      });
      reset();
    },
  });

  const [isCaptchaVerify, setIsCaptchaVerify] = useState(false);
  const [captchaErrorValue, setCaptchaErrorValue] = useState("");
  const onSubmitForm: SubmitHandler<ContactFormValues> = (data) => {
    if (!isCaptchaVerify) {
      setCaptchaErrorValue("captcha not verified");
      return;
    }
    submitFormMutation.mutate(data);
  };

  return (
    <Card className="min-[1200px]:right-4 min-[1200px]:absolute gap-2 bg-white min-[1200px]:-mt-[110px] mb-14 min-[1200px]:w-[380px]">
      <CardHeader className="pb-0">
        <CardTitle className="font-normal text-xl quicksand-medium">
          Have any query? Contact us!
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2">
          <ContactInput
            placeholder="Your Name"
            value={watch("fullName")}
            onChange={(e) => {
              setValue("fullName", e.target.value);
              setError("fullName", { message: "" });
            }}
            error={errors.fullName?.message}
          />
          <ContactInput
            placeholder="Email"
            value={watch("email")}
            onChange={(e) => {
              setValue("email", e.target.value);
              setError("email", { message: "" });
            }}
            error={errors.email?.message}
          />
          <ContactInput
            placeholder="Phone"
            value={watch("phone")}
            onChange={(e) => {
              setValue("phone", e.target.value);
              setError("phone", { message: "" });
            }}
            error={errors.phone?.message}
          />
          <ContactInput
            placeholder="Enquiry Type"
            value={watch("enquiryType")}
            onChange={(e) => {
              setValue("enquiryType", e.target.value);
              setError("enquiryType", { message: "" });
            }}
          />
          <div>
            <Textarea
              className="bg-muted shadow-none px-3 border-none rounded-sm placeholder:text-gray-500"
              placeholder="Message"
              value={watch("message")}
              onChange={(e) => {
                setValue("message", e.target.value);
                setError("message", { message: "" });
              }}
            />
            <p className="text-xs text-red-600">{errors.message?.message}</p>
          </div>
          <CaptchaInput
            onVerify={setIsCaptchaVerify}
            onChange={(e) => {
              setIsCaptchaVerify(e);
            }}
            onValueChange={() => {
              setCaptchaErrorValue("");
            }}
          />
          <p className="text-xs text-red-600">{captchaErrorValue}</p>
        </div>
        <div className="flex items-center mt-4">
          <Button
            className="mx-auto"
            disabled={submitFormMutation.isPending}
            onClick={handleSubmit(onSubmitForm)}
          >
            Submit Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContactForm;
