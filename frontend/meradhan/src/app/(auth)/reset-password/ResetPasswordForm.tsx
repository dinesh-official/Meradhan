"use client";

import { Button } from "@/components/ui/button";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";
import React, { useEffect, useState } from "react";
import PasswordInput from "../_components/PasswordInput";

function ResetPasswordForm({token}:{token: string}) {
  /** -----------------------------
   *  State Management
   *  ----------------------------- */
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");


  const router = useRouter();

  /** -----------------------------
   *  Utilities
   *  ----------------------------- */
  const authApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller
  );

  const isValidPassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/.test(
      pwd
    );

  /** -----------------------------
   *  Mutation: Reset Password
   *  ----------------------------- */
  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async () => {
      const { responseData } = await authApi.resetPassword({ token, password });
      return responseData.message;
    },
    onSuccess: () => {
      setSuccessMsg("Password reset successfully!");
      setPassword("");
      setConfirmPassword("");
      router.replace("/login");
    },
    onError: (error) => {
      setSuccessMsg("");
      if (error instanceof ApiError) {
        setError(error.response?.data.message || error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    },
  });

  /** -----------------------------
   *  Effects
   *  ----------------------------- */
  // Auto-clear error/success after 5 seconds
  useEffect(() => {
    if (!error && !successMsg) return;
    const timer = setTimeout(() => {
      setError("");
      setSuccessMsg("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, successMsg]);

  /** -----------------------------
   *  Handlers
   *  ----------------------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!password || !confirmPassword) {
      return setError("Both fields are required.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (!isValidPassword(password)) {
      return setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
    }

    resetPassword();
  };

  /** -----------------------------
   *  Render
   *  ----------------------------- */
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 text-sm lg:text-base"
    >
      <PasswordInput
        placeholder="Password*"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <PasswordInput
        placeholder="Confirm Password*"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <p className="text-muted-foreground text-xs">
        *Password should be minimum of 8 characters, and must contain: one
        uppercase, one lowercase, one special character & one number
      </p>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}

export default ResetPasswordForm;
