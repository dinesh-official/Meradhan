import { Badge } from "@/components/ui/badge";
import React from "react";
import { FaStar } from "react-icons/fa";
export const colors = {
  aaa: "#008C3B",
  "aa+": "#139D4D",
  aa: "#02A647",
  "aa-": "#00B34C",
  "a+": "#07C557",
  a: "#43C379",
  "a-": "#27CE6D",
  "bbb+": "#FFA900",
  bbb: "#F99D1C",
  "bbb-": "#F68B1F",
  "bb+": "#FF773D",
  bb: "#FF4D4D",
  "bb-": "#F44844",
  "b+": "#F33533",
  b: "#F12222",
  "b-": "#F00F0F",
  c: "#DD0E0E",
  d: "#BD0000",
  unrated: "#6C757D",
};

export const getRatingColor = (val: string) => {
  return (
    colors[val.toLowerCase().split("(")[0] as keyof typeof colors] ||
    colors["unrated"]
  );
};
function CreditRatingBadge({ creditRating }: { creditRating: string }) {
  return (
    <Badge
      className="flex"
      style={{ backgroundColor: getRatingColor(creditRating) }}
    >
      <FaStar />
      <span className="font-semibold">{creditRating}</span>
    </Badge>
  );
}

export default CreditRatingBadge;
