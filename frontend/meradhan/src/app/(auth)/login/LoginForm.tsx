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
          className="peer bg-muted py-5 ps-12 pe-12 border-none placeholder:text-[#7fabd2]"
          placeholder="Email or Phone Number"
          type="email"
        />
        <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-4 text-[#7fabd2] pointer-events-none start-0">
          <FaUser size={16} aria-hidden="true" />
        </div>
      </div>
      <Button>Continue</Button>
      <p className="py-3 text-gray-700 text-center">Or continue with</p>
      <div className="gap-3 lg:gap-5 grid md:grid-cols-3">
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
