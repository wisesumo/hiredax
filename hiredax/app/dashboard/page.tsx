"use client";

import "../../styles/dashboard.css";
import { useState } from "react";
import { StatusPill } from "@/components/ui";
import {
  MOCK_SESSIONS,
  MOCK_SESSION_PENDING,
} from "@/lib/mock-data";
import type { Session } from "@/lib/types";

// Sort sessions most-recently-updated first
const SORTED_SESSIONS = [...MOCK_SESSIONS].sort(
  (a, b) => b.updatedAt.seconds - a.updatedAt.seconds
);

// ── Pending-approval card (expanded, interactive) ──────────────────────────

function PendingCard({ session }: { session: typeof MOCK_SESSION_PENDING }) {
  const result = session.analysisResult!;

  const interiorSurcharge = result.surcharges.interior ?? 0;
  const baseEstimate = result.estimatedPrice - interiorSurcharge;

  const [price, setPrice] = useState(result.estimatedPrice.toFixed(2));
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
    setTimeout(() => {
      setReleased(false);
    }, 2000);
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
          {result.items.map((item) => (
            <li key={item.name} className="db-item-row">
              <span className="db-item-name">{item.name}</span>
              <span className="db-item-detail">
                {item.quantity > 1 ? `×${item.quantity} · ` : ""}
                {item.volume} yd³
              </span>
            </li>
          ))}
        </ul>

        {/* Placeholder photo thumbnails */}
        <div className="db-photos" aria-label="Customer photos">
          {[0, 1, 2].map((i) => (
            <div key={i} className="db-photo-thumb" aria-hidden="true">
              <svg
                className="db-photo-thumb-icon"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          ))}
        </div>

        <p className="db-total-volume">
          Total volume: {result.totalVolume} cubic yards
        </p>
      </div>

      <div className="db-card-divider" />

      {/* Pricing Panel */}
      <div className="db-pricing">
        <div className="db-price-breakdown">
          <div className="db-price-line">
            <span>Base estimate</span>
            <span>${baseEstimate.toFixed(2)}</span>
          </div>
          {interiorSurcharge > 0 && (
            <div className="db-price-line">
              <span>Interior surcharge</span>
              <span>${interiorSurcharge.toFixed(2)}</span>
            </div>
          )}
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

// ── Collapsed cards ────────────────────────────────────────────────────────

function ApprovedCard({ session }: { session: Session }) {
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
          Approved: <strong>${session.approvedPrice?.toFixed(2)}</strong>
        </span>
        <a href="#" className="db-view-link">View Details</a>
      </div>
    </div>
  );
}

function BookedCard({ session }: { session: Session }) {
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
          Slot: <strong>{session.bookingSlot}</strong>
        </span>
        <a href="#" className="db-view-link">View Details</a>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ExpertSealPage() {
  return (
    <div className="db-page">

      {/* Stats Bar */}
      <section className="db-stats-section" aria-label="Key metrics">
        <div className="db-stats-grid">
          <div className="db-stat-card">
            <span className="db-stat-label">Active Jobs</span>
            <span className="db-stat-value db-stat-value--green">3</span>
          </div>
          <div className="db-stat-card">
            <span className="db-stat-label">Today&apos;s Revenue</span>
            <span className="db-stat-value db-stat-value--green">$1,312.50</span>
          </div>
          <div className="db-stat-card">
            <span className="db-stat-label">Conversion Rate</span>
            <span className="db-stat-value db-stat-value--navy">78%</span>
          </div>
          <div className="db-stat-card">
            <span className="db-stat-label">Volume</span>
            <span className="db-stat-value db-stat-value--stone">12.4 yd³</span>
          </div>
        </div>
      </section>

      {/* Live Work Orders Feed */}
      <section className="db-feed-section" aria-label="Live work orders">
        <div className="db-feed-header">
          <h1 className="db-feed-title">Live Work Orders</h1>
          <StatusPill isLive />
        </div>

        {SORTED_SESSIONS.map((session) => {
          if (session.status === "pending_approval") {
            return (
              <PendingCard
                key={session.token}
                session={session as typeof MOCK_SESSION_PENDING}
              />
            );
          }
          if (session.status === "quote_approved") {
            return <ApprovedCard key={session.token} session={session} />;
          }
          if (session.status === "booking_confirmed") {
            return <BookedCard key={session.token} session={session} />;
          }
          return null;
        })}

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
