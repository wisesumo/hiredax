"use client";

import type { InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  error?: string;
  onChange?: (value: string) => void;
}

export function Input({ label, error, onChange, id, name, ...rest }: InputProps) {
  const inputId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", width: "100%" }}>
      <label
        htmlFor={inputId}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          fontWeight: "var(--w-medium)" as React.CSSProperties["fontWeight"],
          color: "var(--text-primary)",
          letterSpacing: "var(--tracking-normal)",
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: "100%",
          minHeight: "var(--touch-min)",
          padding: "0 var(--space-4)",
          borderRadius: "var(--radius-md)",
          border: `1.5px solid ${error ? "var(--status-error-text)" : "var(--border-default)"}`,
          background: "var(--bg-raised)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          color: "var(--text-primary)",
          outline: "none",
          transition: "border-color var(--ease-fast), box-shadow var(--ease-fast)",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-green)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-green-light)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? "var(--status-error-text)"
            : "var(--border-default)";
          e.currentTarget.style.boxShadow = "none";
        }}
        {...rest}
      />
      {error && (
        <span
          role="alert"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--status-error-text)",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
