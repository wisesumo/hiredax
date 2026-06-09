"use client";

import { useRef, useEffect, useCallback } from "react";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark";
  className?: string;
}

const fontSizes = { xs: 14, sm: 20, md: 32, lg: 48, xl: 72 };
const lineHeights = { xs: 1.5, sm: 2, md: 3, lg: 3, xl: 3 };

export function Logo({ size = "md", theme = "light", className = "" }: LogoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const daxRef  = useRef<HTMLSpanElement>(null);
  const hireRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const positionLine = useCallback(() => {
    const wrap = wrapRef.current;
    const hire = hireRef.current;
    const dax  = daxRef.current;
    const line = lineRef.current;
    if (!wrap || !hire || !dax || !line) return;
    const wR = wrap.getBoundingClientRect();
    const hR = hire.getBoundingClientRect();
    const dR = dax.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(hire).fontSize);
    line.style.left  = (dR.left - wR.left) + "px";
    line.style.width = dR.width + "px";
    line.style.top   = (hR.top - wR.top + hR.height - fs * 0.20) + "px";
  }, []);

  useEffect(() => {
    document.fonts.ready.then(positionLine);
    const ro = new ResizeObserver(positionLine);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [positionLine]);

  const color = theme === "dark" ? "var(--color-bone)" : "var(--color-navy)";
  const fs = fontSizes[size];
  const lh = lineHeights[size];

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: "relative", display: "inline-block", lineHeight: 1, userSelect: "none" }}
    >
      <span
        ref={hireRef}
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          display: "inline-block",
          verticalAlign: "bottom",
          fontSize: fs,
          color,
        }}
      >
        Hire
      </span>
      <span
        ref={daxRef}
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          display: "inline-block",
          verticalAlign: "bottom",
          fontSize: fs,
          color,
          transform: "translateY(-0.19em)",
        }}
      >
        Dax
      </span>
      <div
        ref={lineRef}
        style={{
          position: "absolute",
          height: lh,
          background: "var(--color-green)",
          borderRadius: 2,
        }}
      />
    </div>
  );
}
