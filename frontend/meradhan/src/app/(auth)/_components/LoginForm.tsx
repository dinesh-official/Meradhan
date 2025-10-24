import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { FaFacebook, FaMicrosoft, FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

function LoginForm() {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Input
          className="peer ps-12 placeholder:text-[#7fabd2] pe-12 py-5  bg-muted"
          placeholder="Email or Phone Number"
          type="email"
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 text-[#7fabd2] peer-disabled:opacity-50">
          <FaUser size={16} aria-hidden="true" />
        </div>
      </div>
      <Button>Continue</Button>
      <p className="text-center text-gray-700 py-3">Or continue with</p>
      <div className="grid md:grid-cols-3 lg:gap-5 gap-3">
        <Button variant={`outlineGray`} className="w-full">
          <FcGoogle /> Google
        </Button>
        <Button variant={`outlineGray`} className="w-full">
          <FaFacebook className="text-blue-700" /> Facebook
        </Button>
        <Button variant={`outlineGray`} className="w-full">
          <FaMicrosoft className="text-secondary" /> Hotmail
        </Button>
      </div>
    </div>
  );
}

export default LoginForm;
