"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { isEmail } from "@/global/utils/validation.utils";
import apiGateway, { ApiError } from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";

function ForgetPasswordForm() {
  const [emailId, setEmailId] = useState("");
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
  }, [emailId]);

  const authApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller
  );

  const sendResetPasswordEmailMutation = useMutation({
    mutationFn: async () => {
      const { responseData } = await authApi.sendForgetPasswordLink({
        email: emailId,
      });
      return responseData.message;
    },
    onSuccess: (data) => {
      setEmailId("");
      setSuccessMessage(data);
      setErr("");
    },
    onError: (error) => {
      setSuccessMessage("");
      if (error instanceof ApiError) {
        setErr(error.response?.data.message || error.message);
      }
    },
  });

  const handleSubmit = () => {
    const isValid = isEmail(emailId);
    if (!isValid) {
      setErr("Please enter a valid email address");
      return;
    }
    sendResetPasswordEmailMutation.mutate();
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
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={sendResetPasswordEmailMutation.isPending}
      >
        Send Email
      </Button>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      {successMessage && (
        <p className="text-green-600 text-sm">{successMessage}</p>
      )}
    </div>
  );
}

export default ForgetPasswordForm;
