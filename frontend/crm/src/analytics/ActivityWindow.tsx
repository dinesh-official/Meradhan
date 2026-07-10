"use client";
import { useState } from "react";
import { Activity } from "./types";

interface ActivityWindowProps {
  activities: Activity[];
}

export default function ActivityWindow({ activities }: ActivityWindowProps) {
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-20 z-50 r">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-900/95 text-gray-100 px-4 py-2 cursor-pointer rounded-xl shadow-lg border border-gray-700 font-mono text-sm"
        >
          Show Activity Window
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto bg-gray-900/95 text-gray-100 text-sm rounded-xl shadow-lg border border-gray-700 p-4 font-mono">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-base">🧭 User Activity</span>
        <div className="flex items-center space-x-2">
          <span className="opacity-70 text-xs">{activities.length} events</span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-100 text-sm cursor-pointe"
          >
            ✕
          </button>
        </div>
      </div>
      <ul className="space-y-2">
        {activities.map((a, i) => {
          const data = a.details as Record<string, string>;
          const isExpanded = expandedIndexes.includes(i);

          return (
            <li
              key={i}
              className="border-b border-gray-800 pb-2 cursor-pointer"
            >
              <div
                className="flex justify-between items-center mb-1"
                onClick={() => toggleExpand(i)}
              >
                <span className="font-semibold text-blue-400">{a.type}</span>
                <span className="text-gray-500 text-xs">
                  {a.time} {isExpanded ? "▲" : "▼"}
                </span>
              </div>

              {isExpanded && (
                <div className="ml-2 mt-1">
                  {data.url && (
                    <p className="text-cyan-300 underline">{data.url}</p>
                  )}
                  {data.data && typeof data.data === "object" ? (
                    <ul className="ml-2 list-disc text-gray-300">
                      {Object.entries(data.data).map(([key, value], idx) => (
                        <li key={idx}>
                          <span className="font-semibold">{key}:</span>{" "}
                          {String(value)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{data.data}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
