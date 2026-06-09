"use client";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
  id?: string;
}

export function Checkbox({ label, checked, onChange, name, id }: CheckboxProps) {
  const checkId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={checkId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-3)",
        cursor: "pointer",
        minHeight: "var(--touch-min)",
        minWidth: "var(--touch-min)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-base)",
        color: "var(--text-primary)",
        userSelect: "none",
      }}
    >
      <input
        id={checkId}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: 20,
          height: 20,
          flexShrink: 0,
          cursor: "pointer",
          accentColor: "var(--color-green)",
        }}
      />
      {label}
    </label>
  );
}
