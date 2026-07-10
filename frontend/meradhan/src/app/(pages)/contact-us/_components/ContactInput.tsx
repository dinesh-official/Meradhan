import { Input } from "@/components/ui/input";
import React from "react";

interface ContactInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  className?: string;
}

function ContactInput({ error, className = "", ...props }: ContactInputProps) {
  return (
    <div className="relative">
      <Input
        className={`bg-muted px-4 border-none rounded-sm ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export default ContactInput;
