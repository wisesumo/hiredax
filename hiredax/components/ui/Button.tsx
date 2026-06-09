"use client";

import { useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  lineHeight: 1,
  borderRadius: "var(--radius-md)",
  padding: "11px 20px",
  letterSpacing: "-0.005em",
  border: "1.5px solid transparent",
  minHeight: "var(--touch-min)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-2)",
  cursor: "pointer",
  transition: "all var(--ease-fast)",
  userSelect: "none",
};

function getVariantStyle(
  variant: ButtonVariant,
  hovered: boolean
): React.CSSProperties {
  switch (variant) {
    case "primary":
      return {
        background: hovered ? "#6CCA5B" : "var(--color-green)",
        color: "var(--color-navy)",
        borderColor: hovered ? "#6CCA5B" : "var(--color-green)",
        ...(hovered && { transform: "translateY(-1px)", boxShadow: "var(--shadow-md)" }),
      };
    case "secondary":
      return {
        background: hovered ? "#242C42" : "var(--color-navy)",
        color: "var(--color-bone)",
        borderColor: hovered ? "#242C42" : "var(--color-navy)",
        ...(hovered && { transform: "translateY(-1px)", boxShadow: "var(--shadow-md)" }),
      };
    case "outline":
      return {
        background: hovered ? "var(--bg-sunken)" : "transparent",
        color: "var(--color-navy)",
        borderColor: hovered ? "var(--color-navy)" : "var(--border-strong)",
      };
    case "danger":
      return {
        background: hovered ? "#C82333" : "#DC3545",
        color: "#fff",
        borderColor: hovered ? "#C82333" : "#DC3545",
        ...(hovered && { transform: "translateY(-1px)" }),
      };
  }
}

export function Button({
  variant = "primary",
  loading = false,
  disabled = false,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); onMouseLeave?.(e); }}
      style={{
        ...baseStyle,
        ...getVariantStyle(variant, hovered && !isDisabled),
        opacity: isDisabled ? 0.45 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        ...style,
      }}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
