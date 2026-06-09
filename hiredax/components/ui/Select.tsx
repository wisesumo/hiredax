"use client";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
}

export function Select({ label, options, value, onChange, name, id }: SelectProps) {
  const selectId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", width: "100%" }}>
      <label
        htmlFor={selectId}
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
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          minHeight: "var(--touch-min)",
          padding: "0 var(--space-4)",
          borderRadius: "var(--radius-md)",
          border: "1.5px solid var(--border-default)",
          background: "var(--bg-raised)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          color: "var(--text-primary)",
          outline: "none",
          cursor: "pointer",
          appearance: "auto",
          boxSizing: "border-box",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
