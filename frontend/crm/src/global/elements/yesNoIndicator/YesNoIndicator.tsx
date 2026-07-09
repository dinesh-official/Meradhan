"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface YesNoIndicatorProps {
  value: boolean;
  size?: number;
  textSize?: string;
}

const YesNoIndicator = ({
  value,
  size = 16,
  textSize = "text-sm",
}: YesNoIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      {value ? (
        <>
          <CheckCircle
            className={`text-green-500`}
            style={{ width: size, height: size }}
          />
          <p className={`font-medium ${textSize} text-green-600`}>Yes</p>
        </>
      ) : (
        <>
          <XCircle
            className={`text-red-500`}
            style={{ width: size, height: size }}
          />
          <p className={`font-medium ${textSize} text-red-600`}>No</p>
        </>
      )}
    </div>
  );
};

export default YesNoIndicator;
