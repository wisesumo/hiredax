import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({ children, className, header, footer }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg-raised)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-md)",
        overflow: "hidden",
      }}
    >
      {header && (
        <div
          style={{
            padding: "var(--space-4) var(--space-6)",
            borderBottom: "1px solid var(--border-default)",
            fontFamily: "var(--font-body)",
            fontWeight: "var(--w-semibold)" as React.CSSProperties["fontWeight"],
            color: "var(--text-primary)",
            fontSize: "var(--text-base)",
          }}
        >
          {header}
        </div>
      )}
      <div style={{ padding: "var(--space-6)" }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: "var(--space-4) var(--space-6)",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
