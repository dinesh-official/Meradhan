import { Input } from "@/components/ui/input";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Button } from "@/components/ui/button";
function SignUpForm() {
  return (
    <div className="lg:p-12 p-8 flex flex-col gap-3.5">
      <h2
        className={cn(
          "text-2xl font-medium text-gray-700",
          quicksand.className
        )}
      >
        Create an Account
      </h2>
      <div className="grid lg:grid-cols-2 gap-4">
        <Input
          className="bg-muted py-4.5 placeholder:text-[#7fabd2]"
          placeholder="First Name*"
        />
        <Input
          className="bg-muted py-4.5 placeholder:text-[#7fabd2]"
          placeholder="Last Name*"
        />
        <Input
          className="bg-muted py-4.5 placeholder:text-[#7fabd2] lg:col-span-2"
          placeholder="Email ID*"
        />
        <div className="relative">
          <Input
            className="peer ps-11 placeholder:text-[#7fabd2] pe-12 py-5  bg-muted"
            placeholder="Mobile No*"
            type="email"
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-gray-800 peer-disabled:opacity-50">
            +91
          </div>
        </div>
        <Select>
          <SelectTrigger className="w-full shadow-none bg-muted py-5">
            <SelectValue placeholder="Individual (NRI-NRO)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="bg-muted py-4.5 placeholder:text-[#7fabd2]"
          placeholder="Password*"
        />
        <Input
          className="bg-muted py-4.5 placeholder:text-[#7fabd2]"
          placeholder="Confirm Password*"
        />
      </div>
      <p className="text-sm">
        *Password should be minimum of 8 characters, and must contain: one
        uppercase, one lowercase, one special character & one number
      </p>
      <p className="text-sm flex  gap-2">
        <Checkbox
          checkClass="text-white"
          className="border border-gray-300 mt-[2px] data-[state=checked]:bg-secondary data-[state=checked]:text-white data-[state=checked]:border-secondary"
        />
        <span>
          By continue, I certify that I am 18 years of age or older, and agree
          to the{" "}
          <Link href={`#`} className="text-primary underline">
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link href={`#`} className="text-primary underline">
            Privacy Policy
          </Link>
        </span>
      </p>
      <p className="text-sm flex  gap-2">
        <Checkbox
          checkClass="text-white"
          className="border border-gray-300 mt-[2px] data-[state=checked]:bg-secondary data-[state=checked]:text-white data-[state=checked]:border-secondary"
        />
        I agree to receive communications via WhatsApp
      </p>
      <Button className="mt-3">Sign Up</Button>
      <p className="text-center text-sm mt-3">
        Already have an account?{" "}
        <Link href={`/login`} className="text-primary font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}

export default SignUpForm;
