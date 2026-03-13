"use client";

import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IoIosArrowForward } from "react-icons/io";
import { cn } from "@/lib/utils"; // optional helper if you use shadcn/ui

interface ChatInputProps {
  /** Called when the user presses send (Enter or button click) */
  onSend: (message: string) => void;

  /** Optional placeholder text */
  placeholder?: string;

  /** Whether the input is disabled */
  disabled?: boolean;

  /** Show loading indicator on button (e.g., spinner) */
  loading?: boolean;

  /** Controlled input value */
  value?: string;

  /** Default initial value for uncontrolled mode */
  defaultValue?: string;

  /** Optional className for outer container */
  className?: string;

  /** Optional aria label for accessibility */
  ariaLabel?: string;
  onChange:(e:string)=>void
}

export function ChatInput({
  onSend,
  placeholder = "Ask MeraDhan-GPT...",
  disabled = false,
  loading = false,
  value,
  defaultValue = "",
  className,
  ariaLabel,
  onChange
}: ChatInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const message = value ?? internalValue;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    if (value === undefined) setInternalValue(e.target.value);
  };

  const handleSend = () => {
    if (!message.trim() || disabled || loading) return;
    onSend(message.trim());
    if (value === undefined) setInternalValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("bg-white py-2 w-full", className)}>
      <div className="relative">
        <Textarea
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          aria-label={ariaLabel || "Chat input"}
          className={cn(
            "shadow-none p-5 border-gray-200 rounded-2xl w-full h-32 lg:placeholder:text-md placeholder:text-gray-400 resize-none",
            disabled && "opacity-70 cursor-not-allowed"
          )}
        />

        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || loading || !message.trim()}
          className="right-2.5 bottom-2.5 absolute flex justify-center items-center border-none rounded-full w-9 h-9"
        >
          {loading ? (
            <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
          ) : (
            <IoIosArrowForward className="text-lg" />
          )}
        </Button>
      </div>

      <div className="flex justify-between items-center py-2 text-xs">
        <p>
          This is AI, not a financial advisor. Validate key information before
          making decisions.
        </p>
        <p>Powered by: MeraDhan-GPT v1.2</p>
      </div>
    </div>
  );
}

export default ChatInput;
