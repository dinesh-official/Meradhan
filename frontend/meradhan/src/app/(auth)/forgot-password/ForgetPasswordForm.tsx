"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isEmail } from "@/global/utils/validation.utils";
import React, { useState } from "react";
import { FaUser } from "react-icons/fa";

function ForgetPasswordForm() {
  const [emailId, setEmailId] = useState("");
  const [err, setErr] = useState("");

  React.useEffect(() => {
    setErr("");
  }, [emailId]);

  const handleSubmit = () => {
    const isValid = isEmail(emailId);
    if (!isValid) {
      setErr("Please enter a valid email address");
      return;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Input
          className="peer bg-muted py-5 ps-12 pe-12 border-none placeholder:text-[#7fabd2]"
          placeholder="Email ID"
          type="email"
          value={emailId}
          onChange={(e) => setEmailId(e.target.value)}
        />
        <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-4 text-[#7fabd2] pointer-events-none start-0">
          <FaUser size={16} aria-hidden="true" />
        </div>
      </div>
      <Button className="w-full" onClick={handleSubmit}>
        Send Email
      </Button>
      <p className="text-red-600 text-sm">{err}</p>
    </div>
  );
}

export default ForgetPasswordForm;
