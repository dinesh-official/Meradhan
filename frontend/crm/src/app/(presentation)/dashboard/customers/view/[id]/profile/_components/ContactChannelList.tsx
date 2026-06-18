"use client";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";

export function ContactChannelRow({
  icon: Icon,
  label,
  value,
  verified,
  showVerify,
  onVerify,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  verified: boolean;
  showVerify?: boolean;
  onVerify?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 rounded-md bg-background p-2 text-muted-foreground shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 break-all text-sm font-medium">{value}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge value={verified ? "Verified" : "pending"} />
            {showVerify && !verified && onVerify && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={onVerify}
              >
                <ShieldCheck className="mr-1 h-3 w-3" />
                Verify
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactChannelList({
  email,
  phone,
  whatsApp,
  emailVerified,
  phoneVerified,
  isNonIndividual,
  onVerifyEmail,
  onVerifyPhone,
}: {
  email?: string;
  phone?: string;
  whatsApp?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  isNonIndividual: boolean;
  onVerifyEmail: () => void;
  onVerifyPhone: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ContactChannelRow
        icon={Mail}
        label="Email"
        value={email || "—"}
        verified={emailVerified}
        showVerify={isNonIndividual}
        onVerify={onVerifyEmail}
      />
      <ContactChannelRow
        icon={Phone}
        label="Mobile"
        value={phone || "—"}
        verified={phoneVerified}
        showVerify={isNonIndividual}
        onVerify={onVerifyPhone}
      />
      <ContactChannelRow
        icon={MessageCircle}
        label="WhatsApp"
        value={whatsApp || "—"}
        verified={phoneVerified}
      />
    </div>
  );
}
