import React from "react";
import { Star } from "lucide-react";

type StarRatingProps = {
  /** Value between 0 and `max` (supports fractional values) */
  value: number;
  /** Maximum number of stars (default 5) */
  max?: number;
  /** Size in pixels for each star (default 20) */
  size?: number;
  /** Optional extra Tailwind classes for wrapper */
  className?: string;
  /** Show numeric value next to stars */
  showValue?: boolean;
  /** Accessible label for the rating (default: "Rating") */
  ariaLabel?: string;
  onClick?: () => void;
};

/**
 * Read-only StarRating component.
 * - Pass `value` prop (supports fractional values, e.g. 3.5)
 * - Uses lucide-react Star icon
 * - Purely presentational / non-interactive
 * - Tailwind for styling
 */
const StarRating: React.FC<StarRatingProps> = ({
  value,
  max = 5,
  size = 20,
  className = "",
  showValue = false,
  ariaLabel = "Rating",
  onClick,
}) => {
  // clamp value between 0 and max
  const safeValue = Math.max(0, Math.min(value, max));

  const stars = Array.from({ length: max }, (_, i) => {
    // fill is a number between 0 and 1
    const fill = Math.max(0, Math.min(1, safeValue - i));
    const pct = Math.round(fill * 100);
    return { fill, pct };
  });

  return (
    <div
      className={`inline-flex items-center space-x-2 ${className}`}
      role="img"
      aria-label={`${ariaLabel}: ${safeValue} out of ${max}`}
      onClick={onClick}
    >
      <div
        className="flex items-center"
        aria-hidden={showValue ? "false" : "true"}
      >
        {stars.map((s, idx) => (
          <div
            key={idx}
            className="inline-block relative"
            style={{ width: size, height: size, lineHeight: 0 }}
          >
            {/* empty star (base) */}
            <Star size={size} className="text-gray-300" aria-hidden="true" />

            {/* filled star clipped by width percentage */}
            <div
              className="top-0 left-0 absolute overflow-hidden text-secondary pointer-events-none"
              style={{ width: `${s.pct}%`, height: size }}
            >
              <Star size={size} fill="currentColor" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      {showValue && (
        <span className="font-medium text-sm">
          {safeValue.toFixed(1)} / {max}
        </span>
      )}
    </div>
  );
};

export default StarRating;

/*
Example usage:

import StarRating from './StarRating';

// inside JSX:
<StarRating value={3.5} size={24} showValue />

*/
