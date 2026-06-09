"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill={filled ? "var(--color-green)" : "var(--color-bone-deep)"}
      stroke="none"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const displayValue = (!readOnly && hoveredStar !== null) ? hoveredStar : value;

  return (
    <div
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`${value ?? 0} out of 5 stars`}
      style={{ display: "inline-flex" }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayValue !== null && star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            aria-pressed={!readOnly ? value === star : undefined}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: readOnly ? "default" : "pointer",
              padding: 0,
              transition: "transform var(--ease-fast)",
              transform: (!readOnly && hoveredStar === star) ? "scale(1.2)" : "scale(1)",
            }}
          >
            <StarIcon filled={filled} />
          </button>
        );
      })}
    </div>
  );
}
