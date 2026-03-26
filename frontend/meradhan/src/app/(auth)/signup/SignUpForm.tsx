"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import React, { memo } from "react";
import ErrorBox from "../_components/ErrorBox";
import PasswordInput from "../_components/PasswordInput";
import VerifyOtpPopUp from "./_components/VerifyOtpPopUp";

import { cn } from "@/lib/utils";
import { useSignUpAuthFlow } from "./_hooks/useSignUpAuthFlow";
import { useSignUpFormDataState } from "./_hooks/useSignUpFormDataState";
import { useMutation } from "@tanstack/react-query";
import z from "zod";
import { appSchema } from "@root/schema";
import apiGateway, { ApiError } from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import toast from "react-hot-toast";

// ✅ Reusable field wrapper with error display
const Field: React.FC<{
  error?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ error, children, className }) => (
  <div className={cn("relative", className)}>
    {children}
    {error && <ErrorBox>{error}</ErrorBox>}
  </div>
);

function SignUpForm() {
  const form = useSignUpFormDataState();
  const {
    handleSignUpFormChange,
    signUpFormData,
    signUpFormError,
    validateForm,
  } = form;

  const signupApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller,
  );

  const signUpFlow = useSignUpAuthFlow();
  const { sendVerifyOtp, isPending } = signUpFlow;

  const createCustomerMutation = useMutation({
    mutationKey: ["signUpWithCredentials"],
    mutationFn: (
      payload: z.infer<(typeof appSchema.customer)["createNewCustomerSchema"]>,
    ) => signupApi.singUpWithCredentials(payload),
    onSuccess(data) {
      // get the id from the response data to use.
      toast.success("Account created successfully");
      form.handleSignUpFormChange("id", data.responseData!.id);
      sendVerifyOtp({
        emailId: signUpFormData.email,
        mobile: signUpFormData.mobile,
        name: `${signUpFormData.firstName} ${signUpFormData.lastName}`,
        id: data.responseData!.id,
      });
    },
    onError(error) {
      if (error instanceof ApiError) {
        toast.error(error.response?.data.message || error.message);
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Validation failed ❌");
      return;
    }

    createCustomerMutation.mutate({
      firstName: signUpFormData.firstName,
      lastName: signUpFormData.lastName,
      emailId: signUpFormData.email,
      password: signUpFormData.password,
      phoneNo: signUpFormData.mobile,
      termsAccepted: signUpFormData.isAcceptedTerms,
      whatsAppNo: signUpFormData.mobile,
      whatsAppNotificationAllow: signUpFormData.isAcceptedWhatsapp,
      userType:
        signUpFormData.userType as (typeof appSchema.customer.UserAccountType)[number],
    });

    console.log("Form submitted ✅", signUpFormData);
  };

  const disabled = () => {
    const res = appSchema.customer.createNewCustomerSchema.safeParse({
      firstName: signUpFormData.firstName,
      lastName: signUpFormData.lastName,
      emailId: signUpFormData.email,
      password: signUpFormData.password,
      phoneNo: signUpFormData.mobile,
      termsAccepted: signUpFormData.isAcceptedTerms,
      whatsAppNo: signUpFormData.mobile,
      whatsAppNotificationAllow: signUpFormData.isAcceptedWhatsapp,
      userType:
        signUpFormData.userType as (typeof appSchema.customer.UserAccountType)[number],
    });
    return !res.success;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-8 lg:p-12">
        {/* Header */}
        <h2 className={cn("text-2xl quicksand-medium")}>Create an Account</h2>

        {/* --- Form Fields --- */}
        <section className="gap-4 grid lg:grid-cols-2">
          <Field error={signUpFormError.firstName}>
            <Input
              placeholder="First Name*"
              className="bg-muted py-4.5 border-none placeholder:text-[#7fabd2]"
              value={signUpFormData.firstName}
              pattern="[A-Za-z\s.]+"
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z\s.]/g, "");
                handleSignUpFormChange("firstName", value);
              }}
            />
          </Field>

          <Field error={signUpFormError.lastName}>
            <Input
              placeholder="Last Name*"
              className="bg-muted py-4.5 border-none placeholder:text-[#7fabd2]"
              value={signUpFormData.lastName}
              pattern="[A-Za-z\s.]+"
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z\s.]/g, "");
                handleSignUpFormChange("lastName", value);
              }}
            />
          </Field>

          <Field error={signUpFormError.email} className="lg:col-span-2">
            <Input
              placeholder="Email ID*"
              className="bg-muted py-4.5 border-none placeholder:text-[#7fabd2]"
              type="email"
              value={signUpFormData.email}
              onChange={(e) =>
                handleSignUpFormChange("email", e.target.value.toLowerCase())
              }
            />
          </Field>

          <Field error={signUpFormError.mobile}>
            <div className="relative">
              <Input
                placeholder="Mobile No*"
                className="peer bg-muted py-5 ps-11 pe-12 border-none placeholder:text-[#7fabd2]"
                type="text"
                value={signUpFormData.mobile}
                pattern="[5-9][0-9]{9}"
                onChange={(e) => {
                  const value = e.target.value.replace(/[^5-9][0-9]{9}/g, "");
                  handleSignUpFormChange("mobile", value);
                }}
              />
              <span className="absolute inset-y-0 flex items-center ps-3 text-gray-800 text-sm pointer-events-none start-0">
                +91
              </span>
            </div>
          </Field>

          <Field error={signUpFormError.userType}>
            <Select
              value={signUpFormData.userType}
              onValueChange={(value) =>
                handleSignUpFormChange("userType", value)
              }
            >
              <SelectTrigger className="bg-muted shadow-none py-5 border-none w-full">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="INDIVIDUAL_NRI_NRO">
                  Individual (NRI-NRO)
                </SelectItem>
                <SelectItem value="TRUST">Trust</SelectItem>
                <SelectItem value="CORPORATE">Corporate</SelectItem>
                <SelectItem value="HUF">HUF</SelectItem>
                <SelectItem value="LLP">LLP</SelectItem>
                <SelectItem value="PARTNERSHIP_FIRM">
                  Partnership Firm
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field error={signUpFormError.password}>
            <PasswordInput
              placeholder="Password*"
              className="bg-muted py-4.5 border-none placeholder:text-[#7fabd2]"
              value={signUpFormData.password}
              onChange={(e) =>
                handleSignUpFormChange("password", e.target.value)
              }
            />
          </Field>

          <Field error={signUpFormError.confirmPassword}>
            <PasswordInput
              placeholder="Confirm Password*"
              className="bg-muted py-4.5 border-none placeholder:text-[#7fabd2]"
              value={signUpFormData.confirmPassword}
              onChange={(e) =>
                handleSignUpFormChange("confirmPassword", e.target.value)
              }
            />
          </Field>
        </section>

        {/* Password rules */}
        <p className="text-gray-500 text-sm">
          *Password must be at least 8 characters and include one uppercase, one
          lowercase, one special character, and one number.
        </p>

        {/* --- Terms Section --- */}
        <section className="flex flex-col gap-2 text-sm">
          <label className="flex gap-2">
            <Checkbox
              checkClass="text-white"
              checked={signUpFormData.isAcceptedTerms}
              onClick={() =>
                handleSignUpFormChange(
                  "isAcceptedTerms",
                  !signUpFormData.isAcceptedTerms,
                )
              }
              className={cn(
                "data-[state=checked]:bg-secondary mt-[2px] border border-gray-300 data-[state=checked]:border-secondary data-[state=checked]:text-white",
                signUpFormError.isAcceptedTerms && "border-red-500",
              )}
            />
            <span
              className={signUpFormError.isAcceptedTerms ? "text-red-500" : ""}
            >
              By continuing, I certify that I am 18 years of age or older, and
              agree to the{" "}
              <Link
                href="/terms-of-use"
                target="_blank"
                className="text-primary underline"
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                className="text-primary underline"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <label className="flex gap-2">
            <Checkbox
              checkClass="text-white"
              checked={signUpFormData.isAcceptedWhatsapp}
              onClick={() =>
                handleSignUpFormChange(
                  "isAcceptedWhatsapp",
                  !signUpFormData.isAcceptedWhatsapp,
                )
              }
              className="data-[state=checked]:bg-secondary mt-0.5 border border-gray-300 data-[state=checked]:border-secondary data-[state=checked]:text-white"
            />
            <span>I agree to receive communications via WhatsApp</span>
          </label>
        </section>

        {/* --- Actions --- */}
        <Button
          type="submit"
          className="mt-3"
          disabled={isPending || createCustomerMutation.isPending}
        >
          Sign Up
        </Button>

        <p className="mt-3 text-sm text-center">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Login
          </Link>
        </p>
      </form>

      {/*
       * ------------------------------
       * 🔹 Main Component : SignUpForm
       * -------------------------------
       *  */}
      <VerifyOtpPopUp formData={signUpFormData} signUpFlowKyc={signUpFlow} />
      {/* ------------------------------- */}
    </>
  );
}

export default memo(SignUpForm);
