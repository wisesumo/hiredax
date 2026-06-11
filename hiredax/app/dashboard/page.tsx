"use client";

import "../../styles/dashboard.css";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { Spinner, StatusPill } from "@/components/ui";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Session } from "@/lib/types";

// ── Pending-approval card (expanded, interactive) ──────────────────────────

function PendingCard({ session }: { session: Session }) {
  const result = session.analysisResult;

  const [price, setPrice] = useState(
    (session.suggestedPrice ?? result?.suggestedPrice ?? 0).toFixed(2)
  );
  const [heavySurcharge, setHeavySurcharge] = useState(false);
  const [released, setReleased] = useState(false);

  function handleHeavyToggle() {
    const adding = !heavySurcharge;
    setHeavySurcharge(adding);
    setPrice((prev) =>
      (parseFloat(prev) + (adding ? 50 : -50)).toFixed(2)
    );
  }

  function handleApprove() {
    if (released) return;
    setReleased(true);
    // TODO Task 14: Expert Seal Gate write — update Firestore
    // { status: 'quote_approved', approvedPrice, updatedAt }
    setTimeout(() => setReleased(false), 2000);
  }

  return (
    <div className="db-card">
      {/* Header */}
      <div className="db-card-header">
        <div className="db-card-identity">
          <span className="db-card-name">{session.customerName}</span>
          <span className="db-card-phone">{session.customerPhone}</span>
        </div>
        <StatusPill status="pending_approval" />
      </div>

      <div className="db-card-divider" />

      {/* Visual Breakdown Tray */}
      <div className="db-tray">
        <p className="db-tray-heading">Dax identified these items:</p>

        <ul className="db-item-list" aria-label="Identified items">
          {(result?.items ?? []).map((item) => (
            <li key={item} className="db-item-row">
              <span className="db-item-name">{item}</span>
            </li>
          ))}
        </ul>

        {/* Customer photo thumbnails */}
        {session.photoUrls.length > 0 && (
          <div className="db-photos" aria-label="Customer photos">
            {session.photoUrls.map((url, i) => (
              <div key={url} className="db-photo-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="db-photo-thumb-img"
                  src={url}
                  alt={`Customer photo ${i + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        {result && (
          <p className="db-total-volume">
            Total volume: {result.volume_yd3} cubic yards ·{" "}
            {Math.round(result.confidence * 100)}% confidence
          </p>
        )}
      </div>

      <div className="db-card-divider" />

      {/* Pricing Panel */}
      <div className="db-pricing">
        <div className="db-price-breakdown">
          <div className="db-price-line">
            <span>Dax suggested</span>
            <span>${(session.suggestedPrice ?? 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Editable price input */}
        <div className="db-price-input-wrap">
          <span className="db-price-currency" aria-hidden="true">$</span>
          <input
            className="db-price-input"
            type="number"
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-label="Final price"
          />
        </div>

        {/* Heavy item surcharge toggle */}
        <label className="db-surcharge-toggle">
          <input
            className="db-surcharge-checkbox"
            type="checkbox"
            checked={heavySurcharge}
            onChange={handleHeavyToggle}
          />
          <span className="db-surcharge-label">
            Add Heavy Item Surcharge (+$50)
          </span>
        </label>
      </div>

      {/* Approve button — rounded only at card bottom corners */}
      <button
        className={`db-approve-btn${released ? " db-approve-btn--released" : ""}`}
        onClick={handleApprove}
        aria-label="Approve and release quote"
        disabled={released}
      >
        {released ? "✓ Quote Released!" : "✅ Approve & Release Quote"}
      </button>
    </div>
  );
}

// ── Collapsed card (all non-pending statuses) ──────────────────────────────

function CollapsedCard({ session }: { session: Session }) {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <div className="db-card-identity">
          <span className="db-card-name">{session.customerName}</span>
          <span className="db-card-phone">{session.customerPhone}</span>
        </div>
        <StatusPill status={session.status} />
      </div>
      <div className="db-card-collapsed-body">
        <span className="db-card-meta">
          {session.status === "booking_confirmed" ? (
            <>Slot: <strong>2:00 PM – 4:00 PM today</strong></>
          ) : session.approvedPrice !== null ? (
            <>Approved: <strong>${session.approvedPrice.toFixed(2)}</strong></>
          ) : (
            <>In progress</>
          )}
        </span>
        <a href="#" className="db-view-link">View Details</a>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ExpertSealPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const sessionsQuery = query(
      collection(db, "sessions"),
      where("operatorId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        const rows = snapshot.docs.map((d) => {
          // Firestore returns untyped DocumentData; sessions are only ever
          // written with the Session shape (seed script + agent + portal).
          const data = d.data() as Omit<Session, "id">;
          return { ...data, id: d.id };
        });
        // Sorted client-side: where + orderBy on different fields would
        // require a composite Firestore index.
        rows.sort(
          (a, b) =>
            (b.createdAt ? b.createdAt.toMillis() : 0) -
            (a.createdAt ? a.createdAt.toMillis() : 0)
        );
        setSessions(rows);
        setError("");
      },
      () => setError("Could not load work orders. Check your connection and refresh.")
    );
    return unsubscribe;
  }, [user]);

  const loading = authLoading || (user !== null && sessions === null && !error);
  const rows = sessions ?? [];

  // Live stats
  const activeJobs = rows.filter(
    (s) => s.status === "pending_approval" || s.status === "quote_approved"
  ).length;
  const revenue = rows.reduce((sum, s) => sum + (s.approvedPrice ?? 0), 0);
  const conversion =
    rows.length > 0
      ? Math.round(
          (rows.filter((s) => s.status === "booking_confirmed").length /
            rows.length) *
            100
        )
      : 0;
  const volume = rows.reduce(
    (sum, s) => sum + (s.analysisResult?.volume_yd3 ?? 0),
    0
  );

  return (
    <div className="db-page">

      {/* Stats Bar */}
      <section className="db-stats-section" aria-label="Key metrics">
        <div className="db-stats-grid">
          <div className="db-stat-card">
            <span className="db-stat-label">Active Jobs</span>
            <span className="db-stat-value db-stat-value--green">
              {activeJobs}
            </span>
          </div>
          <div className="db-stat-card">
            <span className="db-stat-label">Revenue</span>
            <span className="db-stat-value db-stat-value--green">
              ${revenue.toLocaleString("en-US")}
            </span>
          </div>
          <div className="db-stat-card">
            <span className="db-stat-label">Conversion Rate</span>
            <span className="db-stat-value db-stat-value--navy">
              {conversion}%
            </span>
          </div>
          <div className="db-stat-card">
            <span className="db-stat-label">Volume</span>
            <span className="db-stat-value db-stat-value--stone">
              {volume.toFixed(1)} yd³
            </span>
          </div>
        </div>
      </section>

      {/* Live Work Orders Feed */}
      <section className="db-feed-section" aria-label="Live work orders">
        <div className="db-feed-header">
          <h1 className="db-feed-title">Live Work Orders</h1>
          <StatusPill isLive />
        </div>

        {loading && (
          <div className="db-loading-wrap" role="status" aria-label="Loading work orders">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <div className="db-error-card" role="alert">{error}</div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="db-empty-card" role="status">
            No work orders yet. When Dax takes a call, it appears here live.
          </div>
        )}

        {!loading &&
          !error &&
          rows.map((session) =>
            session.status === "pending_approval" ? (
              <PendingCard key={session.id} session={session} />
            ) : (
              <CollapsedCard key={session.id} session={session} />
            )
          )}

        {/* V2 Preview Banner */}
        <div className="db-v2-banner" aria-hidden="true">
          <p className="db-v2-title">Autonomous Mode (V2 Preview)</p>
          <p className="db-v2-sub">
            Coming soon — Dax will auto-approve within your guardrails.
          </p>
        </div>
      </section>

    </div>
  );
}
