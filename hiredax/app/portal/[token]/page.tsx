"use client";

import "../../../styles/portal.css";
import { useState, useRef, useCallback, useEffect } from "react";
import { Logo, Spinner, StarRating } from "@/components/ui";
import { MOCK_SESSION_PENDING } from "@/lib/mock-data";

// TODO: remove before Task 12 (portal Firestore wiring)
type PortalViewState =
  | "link_sent"
  | "photos_uploading"
  | "analysis_running"
  | "quote_approved"
  | "booking_confirmed"
  | "job_complete";

const DEV_STATES: { value: PortalViewState; label: string }[] = [
  { value: "link_sent",         label: "1 — Link Sent (Upload)" },
  { value: "photos_uploading",  label: "2 — Photos Uploading" },
  { value: "analysis_running",  label: "3 — Analysis Running" },
  { value: "quote_approved",    label: "4 — Quote Approved" },
  { value: "booking_confirmed", label: "5 — Booking Confirmed" },
  { value: "job_complete",      label: "6 — Job Complete" },
];

// ── SVG icons ─────────────────────────────────────────────────────────────────

function CheckIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="#2D7A22" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Price helpers ─────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PortalPage({ params }: { params: { token: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in Task 14 (Firestore session fetch)
  const { token } = params;

  // Dev switcher — controls which state is rendered
  // TODO: remove before Task 12 (portal Firestore wiring)
  const [devState, setDevState] = useState<PortalViewState>("link_sent");

  // Photo upload (STATE 1 & 2)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos,    setPhotos]    = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Canvas signature (STATE 5)
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const isDrawingRef   = useRef(false);
  const lastPointRef   = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Feedback (STATE 6)
  const [rating,            setRating]            = useState<number | null>(null);
  const [feedback,          setFeedback]          = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // ── Photo URL lifecycle ──────────────────────────────────────────────────

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPhotoUrls(urls);
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [photos]);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    setPhotos((prev) => [...prev, ...Array.from(list)].slice(0, 3));
  }

  // ── Canvas setup (runs whenever state switches to booking_confirmed) ──────

  useEffect(() => {
    if (devState !== "booking_confirmed") return;
    setHasDrawn(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const timer = setTimeout(() => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = Math.floor(rect.width  * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.fillStyle   = "#FFFFFF";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.strokeStyle = "#1B2238";
      ctx.lineWidth   = 2;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
    }, 50);
    return () => clearTimeout(timer);
  }, [devState]);

  // ── Canvas drawing ───────────────────────────────────────────────────────

  function getPoint(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    const m = e as React.MouseEvent;
    return { x: m.clientX - rect.left, y: m.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPointRef.current = getPoint(e);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const pt  = getPoint(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !pt || !lastPointRef.current) return;
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPointRef.current = pt;
    if (!hasDrawn) setHasDrawn(true);
  }

  function stopDraw() {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
  }, []);

  // ── Mock data for STATE 4 ────────────────────────────────────────────────

  const ar       = MOCK_SESSION_PENDING.analysisResult!;
  const items    = ar.items;
  const subtotal = ar.estimatedPrice;                    // $412.50 (base + volume)
  const interior = ar.surcharges.interior ?? 0;          // $50
  const total    = subtotal;                             // task spec shows $412.50

  // ── State renderers ──────────────────────────────────────────────────────

  function renderState() {
    switch (devState) {

      // ── STATE 1 — link_sent ──────────────────────────────────────────
      case "link_sent":
        return (
          <>
            <div className="portal-upload-area">
              <div className="portal-upload-icon">📷</div>
              <h1 className="portal-heading">Upload Your Photos</h1>
              <p className="portal-subtext">
                Take 1–3 clear photos of what needs to be removed.
              </p>
              <p className="portal-photo-count">
                {photos.length} photo{photos.length !== 1 ? "s" : ""} selected
              </p>
            </div>

            <div className="portal-btn-stack">
              <button
                type="button"
                className="portal-btn portal-btn-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                📷 Take a Photo
              </button>
              <button
                type="button"
                className="portal-btn portal-btn-outline"
                onClick={() => fileInputRef.current?.click()}
              >
                🖼 Choose from Library
              </button>
            </div>

            {/* Hidden file input — shared by both buttons */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </>
        );

      // ── STATE 2 — photos_uploading ───────────────────────────────────
      case "photos_uploading":
        return (
          <>
            {photoUrls.length > 0 && (
              <div className="portal-thumbs">
                {photoUrls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="portal-thumb"
                  />
                ))}
              </div>
            )}
            {photoUrls.length === 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={{
                    flex: 1, aspectRatio: "1",
                    background: "var(--color-bone-deep)",
                    borderRadius: "var(--radius-md)",
                  }} />
                ))}
              </div>
            )}

            <div className="portal-progress-wrap">
              <div className="portal-progress-bar" />
            </div>

            <p className="portal-subtext" style={{ textAlign: "center", marginTop: 8 }}>
              Uploading your photos…
            </p>
          </>
        );

      // ── STATE 3 — analysis_running ───────────────────────────────────
      case "analysis_running":
        return (
          <div className="portal-spinner-wrap">
            <Spinner size="lg" />
            <h2 className="portal-heading">Analyzing your photos…</h2>
            <p className="portal-subtext">
              This usually takes less than 30 seconds.
            </p>
          </div>
        );

      // ── STATE 4 — quote_approved ─────────────────────────────────────
      case "quote_approved":
        return (
          <>
            <div className="portal-card">
              <div className="portal-card-header">
                <h2 className="portal-heading">Your Estimate Is Ready</h2>
              </div>
              <div className="portal-card-body">

                {/* Mandatory disclaimer */}
                <div className="portal-disclaimer">
                  <p className="portal-disclaimer-title">
                    ⚠️ Preliminary Visual Estimate Only
                  </p>
                  <p className="portal-disclaimer-body">
                    Final price confirmed after on-site inspection.
                  </p>
                </div>

                {/* Items */}
                <div className="portal-items">
                  {items.map((item, i) => (
                    <div key={i} className="portal-item-row">
                      <span className="portal-item-name">
                        {item.quantity > 1 ? `${item.name} (×${item.quantity})` : item.name}
                      </span>
                      <span className="portal-item-meta">
                        {item.volume} cu yd
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="portal-line-row">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal - interior)}</span>
                </div>

                {/* Surcharges */}
                {interior > 0 && (
                  <div className="portal-line-row">
                    <span>Interior access</span>
                    <span>+{fmt(interior)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="portal-total-row">
                  <span className="portal-total-label">Total</span>
                  <span className="portal-total-amount">{fmt(total)}</span>
                </div>
              </div>
            </div>

            <div className="portal-btn-stack">
              <button type="button" className="portal-btn portal-btn-primary">
                ✅ Accept This Estimate
              </button>
              <a href="tel:" className="portal-call-link">
                Questions? Call us back
              </a>
            </div>
          </>
        );

      // ── STATE 5 — booking_confirmed ──────────────────────────────────
      case "booking_confirmed":
        return (
          <>
            <div className="portal-confirmed-top">
              <div className="portal-circle-icon">
                <CheckIcon size={28} />
              </div>
              <h2 className="portal-heading">Estimate Accepted!</h2>
            </div>

            <div className="portal-booking-slot">
              <span className="portal-booking-slot-icon">📅</span>
              <p className="portal-booking-slot-text">
                2:00 PM – 4:00 PM today
              </p>
            </div>

            <div className="portal-divider" />

            <h3 className="portal-heading">Please Sign to Confirm</h3>
            <p className="portal-subtext" style={{ marginBottom: 16 }}>
              Your signature locks in the booking.
            </p>

            <div className="portal-canvas-section">
              <div className="portal-canvas-wrap">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
              </div>
              <button type="button" className="portal-canvas-clear" onClick={clearCanvas}>
                Clear
              </button>
            </div>

            <div className="portal-btn-stack" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="portal-btn portal-btn-primary"
                disabled={!hasDrawn}
                onClick={() => setDevState("job_complete")}
              >
                Sign &amp; Confirm Work Order
              </button>
            </div>
          </>
        );

      // ── STATE 6 — job_complete ───────────────────────────────────────
      case "job_complete":
        return (
          <>
            <div className="portal-complete-wrap">
              <div className="portal-circle-icon">
                <CheckIcon size={28} />
              </div>
              <h2 className="portal-heading">You&apos;re all set, Marcus!</h2>
              <p className="portal-subtext">
                We&apos;ll see you between 2:00 PM and 4:00 PM.
              </p>
            </div>

            <div className="portal-divider" />

            {feedbackSubmitted ? (
              <div className="portal-thanks">
                Thank you! We appreciate it. 🙌
              </div>
            ) : (
              <>
                <p className="portal-section-heading">How was your experience?</p>
                <div className="portal-stars-row">
                  <StarRating value={rating} onChange={setRating} />
                </div>

                <p className="portal-section-heading">Any comments?</p>
                <textarea
                  className="portal-textarea"
                  placeholder="Optional — tell us anything…"
                  maxLength={280}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <p className="portal-char-count">{feedback.length} / 280</p>

                <button
                  type="button"
                  className="portal-btn portal-btn-primary"
                  onClick={() => setFeedbackSubmitted(true)}
                >
                  Submit Feedback
                </button>
              </>
            )}
          </>
        );

      default:
        return null;
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={`portal-page${process.env.NODE_ENV === "development" ? " portal-dev-mode" : ""}`}>

      {/* DEV — state switcher. TODO: remove before Task 12 */}
      {process.env.NODE_ENV === "development" && (
        <div className="portal-dev-bar">
          <span className="portal-dev-label">[DEV] Preview State:</span>
          <select
            className="portal-dev-select"
            value={devState}
            onChange={(e) => setDevState(e.target.value as PortalViewState)}
          >
            {DEV_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="portal-container">
        <header className="portal-header">
          <Logo size="sm" />
        </header>

        {renderState()}
      </div>
    </div>
  );
}
