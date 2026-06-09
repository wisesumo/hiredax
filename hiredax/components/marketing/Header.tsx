import Link from "next/link";
import { Logo } from "@/components/ui";

export function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: "var(--z-overlay)" as unknown as number,
        background: "var(--bg-base)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <div
        className="mkt-container"
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
        }}
      >
        <Logo size="sm" />

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          {/* Hidden at <560px so the Login button always fits */}
          <span
            className="mkt-beta-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 10px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-stone-subtle)",
              color: "var(--color-stone)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
            }}
          >
            Private Beta
          </span>

          {/* Judge access point — styled anchor, not button-in-anchor */}
          <Link href="/login" className="mkt-login-btn">
            Operator Login
          </Link>
        </div>
      </div>
    </header>
  );
}
