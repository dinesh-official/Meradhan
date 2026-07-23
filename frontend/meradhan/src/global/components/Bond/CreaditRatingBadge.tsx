"use client";

import { Badge } from "@/components/ui/badge";
import React from "react";
import { FaStar } from "react-icons/fa";
import { getRatingColor } from "./ratingColors";

export { colors, getRatingColor } from "./ratingColors";

function CreditRatingBadge({ creditRating }: { creditRating: string }) {
  return (
    <Badge
      className="flex"
      style={{ backgroundColor: getRatingColor(creditRating) }}
    >
      <FaStar aria-hidden="true" />
      <span className="font-semibold">{creditRating}</span>
    </Badge>
  );
}

export default CreditRatingBadge;
