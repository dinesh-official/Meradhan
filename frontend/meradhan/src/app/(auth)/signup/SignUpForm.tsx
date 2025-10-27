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
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { memo } from "react";
import VerifyOtpPopUp from "./_components/VerifyOtpPopUp";
import { useSignUpAuthFlow } from "./_hooks/useSignUpAuthFlow";
import { useSignUpFormDataState } from "./_hooks/useSignUpFormDataState";

function SignUpForm() {
  const signUpFormDataState = useSignUpFormDataState();
  const {
    handleSignUpFormChange,
    signUpFormData,
    signUpFormError,
    validateForm,
  } = signUpFormDataState;

  const signupVerifyFlow = useSignUpAuthFlow();

  const { sendVerifyOtp, isPending } = signupVerifyFlow;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = validateForm();
    if (valid) {
      console.log("Form submitted ✅", signUpFormData);
      sendVerifyOtp({
        emailId: signUpFormData.email,
        mobile: signUpFormData.mobile,
        name: signUpFormData.firstName + " " + signUpFormData.lastName,
      });
    } else {
      console.log("Validation failed ❌");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3.5 p-8 lg:p-12"
      >
        <h2
          className={cn(
            "font-medium text-gray-700 text-2xl",
            quicksand.className
          )}
        >
          Create an Account
        </h2>

        <div className="gap-4 grid lg:grid-cols-2">
          <div>
            <Input
              className="bg-muted py-4.5 border-none placeholder:text-[#7fabd2]"
              placeholder="First Name*"
              value={signUpFormData.firstName}
              onChange={(e) =>
                handleSignUpFormChange("firstName", e.target.value)
              }
            />
            {signUpFormError.firstName && (
              <p className="mt-1 text-red-500 text-xs">
                {signUpFormError.firstName}
              </p>
            )}
          </div>

          <div>
            <Input
              className="bg-muted py-4.5 border-none placeholder:text-[#7fabd2]"
              placeholder="Last Name*"
              value={signUpFormData.lastName}
              onChange={(e) =>
                handleSignUpFormChange("lastName", e.target.value)
              }
            />
            {signUpFormError.lastName && (
              <p className="mt-1 text-red-500 text-xs">
                {signUpFormError.lastName}
              </p>
            )}
          </div>

          <div className="lg:col-span-2">
            <Input
              className="bg-muted py-4.5 border-none placeholder:text-[#7fabd2]"
              placeholder="Email ID*"
              value={signUpFormData.email}
              onChange={(e) => handleSignUpFormChange("email", e.target.value)}
            />
            {signUpFormError.email && (
              <p className="mt-1 text-red-500 text-xs">
                {signUpFormError.email}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <Input
                className="peer bg-muted py-5 ps-11 pe-12 border-none placeholder:text-[#7fabd2]"
                placeholder="Mobile No*"
                type="text"
                value={signUpFormData.mobile}
                onChange={(e) =>
                  handleSignUpFormChange("mobile", e.target.value)
                }
              />
              <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 text-gray-800 text-sm pointer-events-none start-0">
                +91
              </div>
            </div>
            {signUpFormError.mobile && (
              <p className="mt-1 text-red-500 text-xs">
                {signUpFormError.mobile}
              </p>
            )}
          </div>

          <div>
            <Select
              value={signUpFormData.userType}
              onValueChange={(e) => handleSignUpFormChange("userType", e)}
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
            {signUpFormError.userType && (
              <p className="mt-1 text-red-500 text-xs">
                {signUpFormError.userType}
              </p>
            )}
          </div>

          <div>
            <Input
              className="bg-muted py-4.5 border-none placeholder:text-[#7fabd2]"
              placeholder="Password*"
              type="password"
              value={signUpFormData.password}
              onChange={(e) =>
                handleSignUpFormChange("password", e.target.value)
              }
            />
            {signUpFormError.password && (
              <p className="mt-1 text-red-500 text-xs">
                {signUpFormError.password}
              </p>
            )}
          </div>

          <div>
            <Input
              className="bg-muted py-4.5 border-none placeholder:text-[#7fabd2]"
              placeholder="Confirm Password*"
              type="password"
              value={signUpFormData.confirmPassword}
              onChange={(e) =>
                handleSignUpFormChange("confirmPassword", e.target.value)
              }
            />
            {signUpFormError.confirmPassword && (
              <p className="mt-1 text-red-500 text-xs">
                {signUpFormError.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <p className="text-gray-500 text-sm">
          *Password must be at least 8 characters and include one uppercase, one
          lowercase, one special character, and one number.
        </p>

        <p className="flex gap-2 text-sm">
          <Checkbox
            checkClass="text-white"
            onClick={() => {
              handleSignUpFormChange(
                "isAcceptedTerms",
                !signUpFormData.isAcceptedTerms
              );
            }}
            checked={signUpFormData.isAcceptedTerms}
            className={cn(
              "data-[state=checked]:bg-secondary mt-[2px] border border-gray-300 data-[state=checked]:border-secondary data-[state=checked]:text-white",
              signUpFormError.isAcceptedTerms && "border-red-500"
            )}
          />
          <span
            className={
              signUpFormError.isAcceptedTerms.length ? "text-red-500" : ""
            }
          >
            By continuing, I certify that I am 18 years of age or older, and
            agree to the{" "}
            <Link href={`#`} className="text-primary underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href={`#`} className="text-primary underline">
              Privacy Policy
            </Link>
          </span>
        </p>

        <p className="flex gap-2 text-sm">
          <Checkbox
            checkClass="text-white"
            className="data-[state=checked]:bg-secondary mt-[2px] border border-gray-300 data-[state=checked]:border-secondary data-[state=checked]:text-white"
          />
          I agree to receive communications via WhatsApp
        </p>

        <Button type="submit" className="mt-3" disabled={isPending}>
          Sign Up
        </Button>

        <p className="mt-3 text-sm text-center">
          Already have an account?{" "}
          <Link href={`/login`} className="font-semibold text-primary">
            Login
          </Link>
        </p>
      </form>
      <VerifyOtpPopUp
        formData={signUpFormDataState.signUpFormData}
        signUpFlowKyc={signupVerifyFlow}
      />
    </>
  );
}

export default memo(SignUpForm);
