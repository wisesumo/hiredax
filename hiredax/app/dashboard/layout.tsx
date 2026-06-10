"use client";

import "../../styles/dashboard.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Calendar, Settings2 } from "lucide-react";
import { Logo } from "@/components/ui";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Work Orders",
    Icon: ClipboardList,
    badge: "1",
  },
  {
    href: "/dashboard/schedule",
    label: "Schedule",
    Icon: Calendar,
    badge: null,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    Icon: Settings2,
    badge: null,
  },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO Task 13: add auth guard here
  // const { operator, loading } = useAuth()
  // if (loading) return <Spinner />
  // if (!operator) redirect('/login')

  const pathname = usePathname();

  return (
    <>
      {/* Mobile — sticky header */}
      <header className="db-nav-mobile-header">
        <Logo size="sm" />
      </header>

      {/* Desktop — fixed sidebar */}
      <nav className="db-nav-sidebar" aria-label="Dashboard navigation">
        <div className="db-nav-logo">
          <Logo size="sm" />
        </div>

        {NAV_ITEMS.map(({ href, label, Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`db-nav-link${active ? " db-nav-link--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="db-nav-icon-wrap">
                <Icon size={18} aria-hidden />
                {badge && (
                  <span className="db-nav-badge" aria-label={`${badge} pending`}>
                    {badge}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Page content */}
      <main className="db-nav-content">{children}</main>

      {/* Mobile — fixed bottom tab bar */}
      <nav className="db-nav-mobile" aria-label="Dashboard navigation">
        {NAV_ITEMS.map(({ href, label, Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`db-nav-mobile-tab${active ? " db-nav-mobile-tab--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="db-nav-icon-wrap">
                <Icon size={20} aria-hidden />
                {badge && (
                  <span className="db-nav-badge" aria-label={`${badge} pending`}>
                    {badge}
                  </span>
                )}
              </span>
              <span className="db-nav-mobile-label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
