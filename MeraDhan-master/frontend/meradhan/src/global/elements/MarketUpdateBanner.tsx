"use client";
import React, { useState } from "react";

interface BannerSubscribeProps {
  title: string;
  subtitle?: string;
  bgColor?: string;
  buttonText?: string;
  onSubmit?: (email: string) => void;
  policyText?: string;
  showPolicyNote?: boolean;
}

const BannerSubscribe: React.FC<BannerSubscribeProps> = ({
  title,
  subtitle = "Subscribe to our newsletter!",
  bgColor = "#ef4822",
  buttonText = "Subscribe",
  onSubmit,
  policyText = `By clicking on “${buttonText}” button, I agree to MeraDhan’s Privacy Policy and Terms of Use.`,
  showPolicyNote = true,
}) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return alert("Please enter a valid email.");
    onSubmit?.(email);
    setEmail("");
  };

  return (
    <section
      className="text-white py-10 px-6"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left side text */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-1">{title}</h2>
          {subtitle && (
            <p className="text-white/90 text-sm">{subtitle}</p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center md:items-start gap-2"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="email"
              placeholder="Your Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md px-4 py-2 w-72 bg-white text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="border border-white rounded-md px-5 py-2 font-medium hover:bg-white hover:text-[#ef4822] transition"
            >
              {buttonText}
            </button>
          </div>

          {showPolicyNote && (
            <p className="text-xs text-white/90 text-center sm:text-left max-w-sm">
              {policyText}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default BannerSubscribe;
