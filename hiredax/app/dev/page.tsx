"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Logo,
  Modal,
  Select,
  Spinner,
  StarRating,
  StatusPill,
} from "@/components/ui";
import type { SessionStatus } from "@/lib/types";

const ALL_STATUSES: SessionStatus[] = [
  "call_active",
  "link_sent",
  "photos_uploading",
  "photos_complete",
  "analysis_running",
  "pending_approval",
  "quote_approved",
  "quote_delivered",
  "booking_confirmed",
  "work_order_signed",
  "job_complete",
  "rated",
];

export default function DevPage() {
  const [inputVal, setInputVal]   = useState("");
  const [selectVal, setSelectVal] = useState("one");
  const [checked, setChecked]     = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating]       = useState<number | null>(null);

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-10)" }}>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
        Component QA — <span style={{ color: "var(--color-green)" }}>HireDax</span>
      </h1>

      {/* ── Logo ── */}
      <section>
        <h2 style={sh}>Logo</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-8)", flexWrap: "wrap" }}>
          <Logo size="xs" />
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
        </div>
        <div style={{ marginTop: "var(--space-4)", background: "var(--color-navy)", display: "inline-block", padding: "var(--space-4) var(--space-6)", borderRadius: "var(--radius-lg)" }}>
          <Logo size="md" theme="dark" />
        </div>
      </section>

      {/* ── Spinner ── */}
      <section>
        <h2 style={sh}>Spinner</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      </section>

      {/* ── Button — order: primary, outline, danger, secondary, disabled, loading ── */}
      <section>
        <h2 style={sh}>Button</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "center" }}>
          <Button variant="primary">Approve Quote</Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="secondary">Sign In</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" loading>Saving…</Button>
        </div>
      </section>

      {/* ── StatusPill ── */}
      <section>
        <h2 style={sh}>StatusPill</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "center" }}>
          <StatusPill isLive />
          {ALL_STATUSES.map((s) => <StatusPill key={s} status={s} />)}
        </div>
      </section>

      {/* ── Card ── */}
      <section>
        <h2 style={sh}>Card</h2>
        <Card
          header="Job #4821 — ATL Junk Pros"
          footer={<Button variant="primary" style={{ width: "100%" }}>Approve &amp; Release Quote</Button>}
        >
          <p style={{ margin: 0, color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "var(--text-base)" }}>
            2-seater couch · 1 queen mattress · 6 boxes — Estimated volume: 18 cu yd
          </p>
        </Card>
      </section>

      {/* ── Input ── */}
      <section>
        <h2 style={sh}>Input</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input label="Business Name" placeholder="ATL Junk Pros" value={inputVal} onChange={setInputVal} />
          <Input label="Email Address" type="email" placeholder="sam@example.com" value="" error="This field is required" onChange={() => {}} />
        </div>
      </section>

      {/* ── Select ── */}
      <section>
        <h2 style={sh}>Select</h2>
        <Select
          label="Service Type"
          value={selectVal}
          onChange={setSelectVal}
          options={[
            { value: "one", label: "Junk Removal" },
            { value: "two", label: "Landscaping" },
            { value: "three", label: "Pressure Washing" },
          ]}
        />
      </section>

      {/* ── Checkbox ── */}
      <section>
        <h2 style={sh}>Checkbox</h2>
        <Checkbox label="I agree to the Terms of Service" checked={checked} onChange={setChecked} />
      </section>

      {/* ── StarRating ── */}
      <section>
        <h2 style={sh}>StarRating</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <p style={lbl}>Interactive (hover me)</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <p style={lbl}>Read-only (4★)</p>
            <StarRating value={4} readOnly />
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      <section>
        <h2 style={sh}>Modal</h2>
        <Button variant="outline" onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Approve Quote">
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "var(--text-secondary)", marginTop: 0 }}>
            Releasing $465 to the caller. This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-6)" }}>
            <Button variant="primary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Approve &amp; Release</Button>
            <Button variant="outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </Modal>
      </section>

    </div>
  );
}

const sh: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "var(--text-lg)",
  fontWeight: 600,
  color: "var(--text-primary)",
  marginTop: 0,
  marginBottom: "var(--space-4)",
};

const lbl: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-sm)",
  color: "var(--text-secondary)",
  margin: "0 0 var(--space-2)",
};
