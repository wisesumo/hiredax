"use client";

import "../../styles/dashboard.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ClipboardList, Calendar, Settings2 } from "lucide-react";
import { Logo, Spinner } from "@/components/ui";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  // Auth guard — logged-out visitors never see the dashboard
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Live badge — number of sessions waiting on the Expert Seal
  useEffect(() => {
    if (!user) return;
    const pendingQuery = query(
      collection(db, "sessions"),
      where("operatorId", "==", user.uid),
      where("status", "==", "pending_approval")
    );
    const unsubscribe = onSnapshot(pendingQuery, (snapshot) => {
      setPendingCount(snapshot.size);
    });
    return unsubscribe;
  }, [user]);

  if (loading || !user) {
    return (
      <div className="db-auth-check" role="status" aria-label="Checking sign-in">
        <Spinner size="lg" />
      </div>
    );
  }

  const badge = pendingCount > 0 ? String(pendingCount) : null;
  const navItems = [
    { href: "/dashboard", label: "Work Orders", Icon: ClipboardList, badge },
    { href: "/dashboard/schedule", label: "Schedule", Icon: Calendar, badge: null },
    { href: "/dashboard/settings", label: "Settings", Icon: Settings2, badge: null },
  ] as const;

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

        {navItems.map(({ href, label, Icon, badge: itemBadge }) => {
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
                {itemBadge && (
                  <span className="db-nav-badge" aria-label={`${itemBadge} pending`}>
                    {itemBadge}
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
        {navItems.map(({ href, label, Icon, badge: itemBadge }) => {
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
                {itemBadge && (
                  <span className="db-nav-badge" aria-label={`${itemBadge} pending`}>
                    {itemBadge}
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
