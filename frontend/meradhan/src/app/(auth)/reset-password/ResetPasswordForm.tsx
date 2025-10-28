"use client";
import React, { useEffect, useState } from "react";
import PasswordInput from "../_components/PasswordInput";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [cPassword, setcPassword] = useState("");

  const [err, setErr] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccessMessage("");
      setErr("");
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [successMessage, err]);

  React.useEffect(() => {
    setErr("");
    setSuccessMessage("");
  }, [password, cPassword]);
  return (
    <div className="flex flex-col gap-3">
      <PasswordInput placeholder="Password*" />
      <PasswordInput placeholder="Confirm Password*" />

      <p className="text-sm lg:text-base">
        *Password should be minimum of 8 characters, and must contain: one
        uppercase, one lowercase, one special character & one number
      </p>
      <Button className="w-full">Reset Password</Button>
    </div>
  );
}

export default ResetPasswordForm;
