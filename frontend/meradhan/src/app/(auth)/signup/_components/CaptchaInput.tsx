"use client";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { TbReload } from "react-icons/tb";

type CaptchaInputProps = {
  onVerify?: (e: boolean) => void;
  onChange?: (isCorrect: boolean) => void;
  className?: string;
  placeholder?: string;
  length?: number;
  onValueChange?: () => void;
};

export default function CaptchaInput({
  onVerify,
  onChange,
  onValueChange,
  className = "",
  placeholder = "Captcha Code*",
  length = 6,
}: CaptchaInputProps) {
  const [captcha, setCaptcha] = useState("");
  const [value, setValue] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const randomText = (len: number) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    return Array.from(
      { length: len },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 180;
    const height = 40;
    canvas.width = width;
    canvas.height = height;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f7f9fb");
    gradient.addColorStop(1, "#e3e7ee");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Random noise dots
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      }, ${Math.random() * 0.8})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 1.5 + 0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Random lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      }, 0.4)`;
      ctx.lineWidth = Math.random() * 1.2 + 0.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Randomized text positions
    const fonts = ["Verdana", "Courier", "Georgia", "Arial Black", "Tahoma"];
    let currentX = 15; // start position

    for (let i = 0; i < text.length; i++) {
      const letter = text[i];
      const fontSize = 22 + Math.random() * 10;
      const font = `${fontSize}px ${
        fonts[Math.floor(Math.random() * fonts.length)]
      }`;
      ctx.font = font;
      ctx.textBaseline = "middle";
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, ${
        30 + Math.random() * 40
      }%)`;

      // Random Y position (to create a zigzag pattern)
      const y = height / 2 + (Math.random() - 0.5) * 12;

      // Slight random angle
      const angle = (Math.random() - 0.5) * 0.8;

      ctx.save();
      ctx.translate(currentX, y);
      ctx.rotate(angle);
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 2;
      ctx.fillText(letter, 0, 0);
      ctx.restore();

      // Move X randomly to next letter
      currentX += 20 + Math.random() * 10;
    }

    // Curved noise lines
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * height);
      for (let j = 0; j < width; j += 10) {
        ctx.lineTo(j, Math.sin(j / 20 + i) * 5 + height / 2 + i * 6);
      }
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      }, 0.3)`;
      ctx.stroke();
    }
  };

  const generate = useCallback(() => {
    const newCaptcha = randomText(length);
    setCaptcha(newCaptcha);
    drawCaptcha(newCaptcha);
    setValue("");
  }, [length]);

  useEffect(() => {
    generate();
  }, [generate]);

  useEffect(() => {
    if (value === "") {
      onVerify?.(false);
      onChange?.(false);
      return;
    }
    const correct = value.trim() === captcha;
    onChange?.(correct);
    onVerify?.(correct);
  }, [value, captcha, onChange, onVerify]);

  return (
    <div
      className={`flex items-center sm:flex-row flex-col gap-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          width={200}
          height={50}
          className="bg-white shadow-sm rounded-md select-none"
        />
        <button
          type="button"
          onClick={generate}
          className="text-primary cursor-pointer"
          title="Refresh Captcha"
        >
          <TbReload size={20} />
        </button>
      </div>

      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onValueChange?.();
          setValue(e.target.value);
        }}
        className="py-5"
      />
    </div>
  );
}
