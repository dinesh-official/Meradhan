"use client";
import { useEffect, useState } from "react";

const FONT_LEVELS = [0.8, 0.9, 1, 1.1, 1.2];
const LS_FONT = "a11y-font-scale";
const LS_CONTRAST = "a11y-high-contrast";

function WidgetInner() {
  const [open, setOpen] = useState(false);
  const [fontIdx, setFontIdx] = useState(2);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const savedFont = localStorage.getItem(LS_FONT);
    const savedContrast = localStorage.getItem(LS_CONTRAST);
    if (savedFont) {
      const idx = FONT_LEVELS.indexOf(parseFloat(savedFont));
      if (idx !== -1) setFontIdx(idx);
    }
    if (savedContrast === "1") setHighContrast(true);
  }, []);

  useEffect(() => {
    const scale = FONT_LEVELS[fontIdx];
    document.documentElement.style.setProperty("--a11y-font-scale", String(scale));
    localStorage.setItem(LS_FONT, String(scale));
  }, [fontIdx]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.remove("high-contrast");
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(LS_CONTRAST, highContrast ? "1" : "0");
  }, [highContrast]);

  return (
    <div className="relative">
      <button
        aria-label="Accessibility options"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="4" r="2" />
          <path d="M12 7c-2.76 0-5 2.24-5 5h2c0-1.65 1.35-3 3-3s3 1.35 3 3h2c0-2.76-2.24-5-5-5zm-1 9v5h2v-5h3l-4-4-4 4h3z" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Accessibility settings"
          className="absolute right-0 top-11 z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex flex-col gap-4"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Font Size</p>
            <div className="flex items-center gap-2">
              <button
                aria-label="Decrease font size"
                disabled={fontIdx === 0}
                onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                A−
              </button>
              <button
                aria-label="Reset font size"
                onClick={() => setFontIdx(2)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                Reset
              </button>
              <button
                aria-label="Increase font size"
                disabled={fontIdx === FONT_LEVELS.length - 1}
                onClick={() => setFontIdx((i) => Math.min(FONT_LEVELS.length - 1, i + 1))}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                A+
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">High Contrast</span>
            <button
              role="switch"
              aria-checked={highContrast}
              aria-label="Toggle high contrast"
              onClick={() => setHighContrast((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${highContrast ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highContrast ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccessibilityWidget() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" aria-hidden="true" />;
  return <WidgetInner />;
}
