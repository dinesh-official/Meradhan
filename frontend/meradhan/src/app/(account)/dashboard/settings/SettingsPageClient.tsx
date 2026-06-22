"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

function CompactPasscodeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <InputOTP
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
    >
      <InputOTPGroup className="gap-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className="bg-muted border border-gray-200 rounded-md size-9"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

type PasscodeDialogMode = "setup" | "change";

export default function SettingsPageClient() {
  const authApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller,
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customer-two-factor-settings"],
    queryFn: () => authApi.getTwoFactorSettings(),
  });

  const settings = data?.responseData;

  const [enabled, setEnabled] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [passcodeDialogOpen, setPasscodeDialogOpen] = useState(false);
  const [passcodeDialogMode, setPasscodeDialogMode] =
    useState<PasscodeDialogMode>("setup");

  useEffect(() => {
    if (!settings) return;
    setEnabled(settings.enabled);
    setPasscode("");
    setConfirmPasscode("");
    setPasscodeDialogOpen(false);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      enabled: boolean;
      passcode?: string;
      confirmPasscode?: string;
    }) => authApi.updateTwoFactorSettings(payload),
    onSuccess: async (response) => {
      toast.success(response.message || "2FA settings updated");
      setPasscode("");
      setConfirmPasscode("");
      setPasscodeDialogOpen(false);
      await refetch();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Could not update 2FA settings");
    },
  });

  const isCredentialsAccount = settings?.signinWith === "CREDENTIALS";
  const hasPasswordSet = settings?.hasPasswordSet ?? false;
  const canUseTwoFactor = isCredentialsAccount && hasPasswordSet;
  const isFirstTimeSetup =
    canUseTwoFactor && !settings?.enabled && !settings?.hasPasscodeSet;

  const toggleDirty = useMemo(() => {
    if (!settings) return false;
    return enabled !== settings.enabled;
  }, [enabled, settings]);

  const canSavePasscode = useMemo(() => {
    return (
      passcode.length === 6 &&
      confirmPasscode.length === 6 &&
      passcode === confirmPasscode
    );
  }, [passcode, confirmPasscode]);

  const resetPasscodeFields = () => {
    setPasscode("");
    setConfirmPasscode("");
  };

  const handleToggle = (checked: boolean) => {
    if (checked && !canUseTwoFactor) {
      toast.error("Set a login password before enabling 2FA.");
      return;
    }
    setEnabled(checked);
    if (!checked) {
      resetPasscodeFields();
      setPasscodeDialogOpen(false);
    }
  };

  const openPasscodeDialog = (mode: PasscodeDialogMode) => {
    setPasscodeDialogMode(mode);
    resetPasscodeFields();
    setPasscodeDialogOpen(true);
  };

  const handlePasscodeDialogOpenChange = (open: boolean) => {
    setPasscodeDialogOpen(open);
    if (!open) resetPasscodeFields();
  };

  const handleSavePasscode = () => {
    if (!canSavePasscode) return;
    saveMutation.mutate({
      enabled: true,
      passcode,
      confirmPasscode,
    });
  };

  const handleSaveToggle = () => {
    saveMutation.mutate({ enabled });
  };

  const handleCancelToggle = () => {
    setEnabled(settings?.enabled ?? false);
    resetPasscodeFields();
  };

  return (
    <Card accountMode>
      <CardHeader accountMode className="border-gray-200 border-b">
        <CardTitle className="text-xl">Security Settings</CardTitle>
        <CardDescription className="text-gray-600">
          Manage how two-factor authentication works for your dashboard login.
        </CardDescription>
      </CardHeader>

      <CardContent accountMode className="py-6">
        <div className="space-y-6">
          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 rounded-lg border border-gray-200 p-4">
            <div className="space-y-1 flex-1">
              <h3 className="font-medium text-base">Two-Factor Authentication</h3>
              <p className="text-gray-600 text-sm">
                After your password, enter a 6-digit passcode you set here to sign in.
              </p>
            </div>
            {canUseTwoFactor && !isFirstTimeSetup && (
              <Switch
                checked={enabled}
                disabled={isLoading || saveMutation.isPending}
                onCheckedChange={handleToggle}
                className="shrink-0 data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-primary"
              />
            )}
          </div>

          {!isCredentialsAccount && !isLoading && (
            <div className="rounded-lg bg-amber-50 p-4 text-amber-900 text-sm">
              2FA is available only for password-based accounts. Social-login
              accounts need a password login flow before 2FA can be enabled.
            </div>
          )}

          {isCredentialsAccount && !hasPasswordSet && !isLoading && (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-amber-900 text-sm">
                Set a login password first. 2FA works after password sign-in.
              </p>
              <Button asChild variant="outlineGray" className="w-fit">
                <Link href="/forgot-password">Set Password</Link>
              </Button>
            </div>
          )}

          {isFirstTimeSetup && (
            <Button
              onClick={() => openPasscodeDialog("setup")}
              disabled={isLoading || saveMutation.isPending}
            >
              Set passcode
            </Button>
          )}

          {canUseTwoFactor && settings?.enabled && settings?.hasPasscodeSet && (
            <Button
              variant="outlineGray"
              className="w-fit"
              onClick={() => openPasscodeDialog("change")}
              disabled={isLoading || saveMutation.isPending}
            >
              Change passcode
            </Button>
          )}

          {toggleDirty && (
            <div className="flex sm:flex-row flex-col gap-3 pt-2 border-gray-100 border-t">
              <Button
                disabled={isLoading || saveMutation.isPending}
                onClick={handleSaveToggle}
              >
                {saveMutation.isPending ? "Saving..." : "Save 2FA Settings"}
              </Button>
              <Button
                variant="outlineGray"
                disabled={isLoading || saveMutation.isPending}
                onClick={handleCancelToggle}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={passcodeDialogOpen} onOpenChange={handlePasscodeDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">
              {passcodeDialogMode === "setup"
                ? "Set 6-digit passcode"
                : "Change 6-digit passcode"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {passcodeDialogMode === "setup"
                ? "Choose a 6-digit passcode you will enter every time you log in."
                : "Enter a new 6-digit passcode for your account."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm">Passcode</p>
              <CompactPasscodeInput value={passcode} onChange={setPasscode} />
            </div>
            <div className="space-y-2">
              <p className="text-sm">Confirm passcode</p>
              <CompactPasscodeInput
                value={confirmPasscode}
                onChange={setConfirmPasscode}
              />
            </div>
            {passcode &&
              confirmPasscode &&
              passcode.length === 6 &&
              confirmPasscode.length === 6 &&
              passcode !== confirmPasscode && (
                <p className="text-red-600 text-sm">Passcodes do not match.</p>
              )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outlineGray"
              disabled={saveMutation.isPending}
              onClick={() => handlePasscodeDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={saveMutation.isPending || !canSavePasscode}
              onClick={handleSavePasscode}
            >
              {saveMutation.isPending
                ? "Saving..."
                : passcodeDialogMode === "setup"
                  ? "Enable 2FA"
                  : "Update passcode"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
