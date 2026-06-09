"use client";

import "../../styles/onboarding.css";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Logo, Spinner } from "@/components/ui";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

function buildTimeRange(
  startH: number,
  endH: number
): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = startH; h <= endH; h++) {
    for (const m of [0, 30]) {
      if (h === endH && m > 0) break;
      const value = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      options.push({ value, label: formatTime(value) });
    }
  }
  return options;
}

const OPEN_TIMES  = buildTimeRange(6, 12);  // 6:00 AM – 12:00 PM
const CLOSE_TIMES = buildTimeRange(12, 22); // 12:00 PM – 10:00 PM

const EQUIPMENT_OPTIONS = [
  { value: "dumpster", label: "Dumpsters",     icon: "🗑" },
  { value: "flatbed",  label: "Flatbed Trucks", icon: "🚚" },
  { value: "pickup",   label: "Pickup Trucks",  icon: "🛻" },
];

interface TaskRow {
  label: string;
  hours: number;
  flatRate: number;
}

const DEFAULT_TASKS: TaskRow[] = [
  { label: "Construction Debris Removal", hours: 2, flatRate: 150 },
  { label: "Basement Cleanout",           hours: 3, flatRate: 200 },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="none"
      stroke="#2D7A22" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SmallCheckIcon() {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12} fill="none"
      stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="10 3 5 9 2 6" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [companyName,   setCompanyName]   = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [yourName,      setYourName]      = useState("");

  // Step 2
  const [forwardingDone, setForwardingDone] = useState(false);

  // Step 3
  const [openTime,  setOpenTime]  = useState("08:00");
  const [closeTime, setCloseTime] = useState("20:00");

  // Step 4
  const [equipment, setEquipment] = useState<string[]>([]);

  // Step 5
  const [serviceRadius, setServiceRadius] = useState(25);
  const [zipInput,      setZipInput]      = useState("");
  const [serviceZips,   setServiceZips]   = useState<string[]>([]);

  // Step 6
  const [tasks, setTasks] = useState<TaskRow[]>(DEFAULT_TASKS);

  // Step 7
  const [testState, setTestState] = useState<"idle" | "running" | "done">("idle");
  const [showToast, setShowToast] = useState(false);

  // ── Navigation guards ────────────────────────────────────────────────────

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!companyName.trim() && !!yourName.trim();
      case 2: return forwardingDone;
      case 4: return equipment.length > 0;
      case 5: return serviceZips.length > 0;
      default: return true;
    }
  }

  function next() { if (canProceed()) setStep((s) => s + 1); }
  function back() { setStep((s) => s - 1); }

  // ── Step 7 actions ───────────────────────────────────────────────────────

  function runTestCall() {
    setTestState("running");
    setTimeout(() => setTestState("done"), 2000);
  }

  function completeSetup() {
    setShowToast(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  // ── Zip helpers ──────────────────────────────────────────────────────────

  const addZip = useCallback(() => {
    const z = zipInput.trim();
    if (z && !serviceZips.includes(z)) {
      setServiceZips((prev) => [...prev, z]);
    }
    setZipInput("");
  }, [zipInput, serviceZips]);

  const removeZip = useCallback((z: string) => {
    setServiceZips((prev) => prev.filter((x) => x !== z));
  }, []);

  // ── Equipment toggle ─────────────────────────────────────────────────────

  const toggleEquipment = useCallback((value: string) => {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }, []);

  // ── Task helpers ─────────────────────────────────────────────────────────

  function updateTask(index: number, patch: Partial<TaskRow>) {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t))
    );
  }

  function addTask() {
    setTasks((prev) => [...prev, { label: "", hours: 1, flatRate: 0 }]);
  }

  // ── Step renderers ───────────────────────────────────────────────────────

  function renderStep() {
    switch (step) {

      // ── Step 1 — Business Info ─────────────────────────────────────
      case 1:
        return (
          <div className="ob-card">
            <h2 className="ob-card-title">Tell us about your business</h2>
            <p className="ob-card-desc">
              We&apos;ll use this to personalise Dax&apos;s greeting and your
              operator profile.
            </p>
            <div className="ob-fields">
              <div className="ob-field">
                <label className="ob-label" htmlFor="companyName">
                  Company Name{" "}
                  <span style={{ color: "var(--status-error-text)" }}>*</span>
                </label>
                <input
                  id="companyName"
                  className="ob-input"
                  type="text"
                  placeholder="ATL Junk Pros"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="ob-field">
                <label className="ob-label" htmlFor="businessPhone">
                  Business Phone
                </label>
                <input
                  id="businessPhone"
                  className="ob-input"
                  type="tel"
                  placeholder="(678) 555-0100"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                />
              </div>
              <div className="ob-field">
                <label className="ob-label" htmlFor="yourName">
                  Your Name{" "}
                  <span style={{ color: "var(--status-error-text)" }}>*</span>
                </label>
                <input
                  id="yourName"
                  className="ob-input"
                  type="text"
                  placeholder="Sam"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      // ── Step 2 — Call Forwarding ───────────────────────────────────
      case 2:
        return (
          <div className="ob-navy-card">
            <h2 className="ob-navy-title">Set Up Call Forwarding</h2>
            <div className="ob-forwarding-steps">
              {[
                "Pick up your business phone",
                "Dial *72 followed by your HireDax system number",
                "Wait for the confirmation tone, then hang up",
                "Test: call your business number from another phone",
              ].map((text, i) => (
                <div key={i} className="ob-forwarding-step">
                  <span className="ob-forwarding-step-num">{i + 1}.</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <p className="ob-forwarding-note">
              Disable call forwarding anytime by dialling *73 from your
              business phone.
            </p>
            <label className="ob-forwarding-confirm">
              <input
                type="checkbox"
                checked={forwardingDone}
                onChange={(e) => setForwardingDone(e.target.checked)}
              />
              <span className="ob-forwarding-confirm-label">
                ✓ I&apos;ve set this up
              </span>
            </label>
          </div>
        );

      // ── Step 3 — Operating Hours ───────────────────────────────────
      case 3:
        return (
          <div className="ob-card">
            <h2 className="ob-card-title">Operating Hours</h2>
            <p className="ob-card-desc">
              Dax only books jobs within these hours.
            </p>
            <div className="ob-hours-row">
              <div className="ob-field">
                <label className="ob-label" htmlFor="openTime">
                  Opening Time
                </label>
                <select
                  id="openTime"
                  className="ob-select"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                >
                  {OPEN_TIMES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ob-field">
                <label className="ob-label" htmlFor="closeTime">
                  Closing Time
                </label>
                <select
                  id="closeTime"
                  className="ob-select"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                >
                  {CLOSE_TIMES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      // ── Step 4 — Equipment ─────────────────────────────────────────
      case 4:
        return (
          <div className="ob-card">
            <h2 className="ob-card-title">Equipment Inventory</h2>
            <p className="ob-card-desc">
              Select every vehicle type your crew has available. Dax uses this
              to confirm job fit with callers.
            </p>
            <div className="ob-equipment-grid">
              {EQUIPMENT_OPTIONS.map(({ value, label, icon }) => {
                const selected = equipment.includes(value);
                return (
                  <div
                    key={value}
                    className={`ob-equipment-item${selected ? " ob-selected" : ""}`}
                    role="checkbox"
                    aria-checked={selected}
                    tabIndex={0}
                    onClick={() => toggleEquipment(value)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        toggleEquipment(value);
                      }
                    }}
                  >
                    <span className="ob-equipment-icon">{icon}</span>
                    <span className="ob-equipment-label">{label}</span>
                    <div className="ob-equipment-check">
                      {selected && <SmallCheckIcon />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ── Step 5 — Service Area ──────────────────────────────────────
      case 5:
        return (
          <div className="ob-card">
            <h2 className="ob-card-title">Service Area</h2>
            <p className="ob-card-desc">
              Set your radius and target zip codes. Dax uses this to qualify
              callers by location.
            </p>
            <div className="ob-fields">
              <div className="ob-field">
                <label className="ob-label" htmlFor="serviceRadius">
                  Service Radius (miles)
                </label>
                <input
                  id="serviceRadius"
                  className="ob-input"
                  type="number"
                  min={1}
                  max={200}
                  value={serviceRadius}
                  onChange={(e) =>
                    setServiceRadius(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  style={{ maxWidth: 160 }}
                />
              </div>
              <div className="ob-field">
                <label className="ob-label">
                  Target Zip Codes{" "}
                  <span style={{ color: "var(--status-error-text)" }}>*</span>
                </label>
                {serviceZips.length > 0 && (
                  <div className="ob-zip-pills">
                    {serviceZips.map((z) => (
                      <span key={z} className="ob-zip-pill">
                        {z}
                        <button
                          type="button"
                          className="ob-zip-remove"
                          aria-label={`Remove zip ${z}`}
                          onClick={() => removeZip(z)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="ob-zip-row">
                  <input
                    className="ob-input"
                    type="text"
                    placeholder="e.g. 30213"
                    maxLength={10}
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addZip(); }
                    }}
                  />
                  <button type="button" className="ob-zip-add" onClick={addZip}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      // ── Step 6 — Task Durations ────────────────────────────────────
      case 6:
        return (
          <div className="ob-card">
            <h2 className="ob-card-title">Task Durations &amp; Flat Rates</h2>
            <p className="ob-card-desc">
              Set estimated hours and flat rates for your most common job types.
              Dax uses these when confirming booking windows.
            </p>
            <div className="ob-task-rows">
              {tasks.map((task, i) => (
                <div key={i} className="ob-task-row">
                  {i < DEFAULT_TASKS.length ? (
                    <p className="ob-task-name">{task.label}</p>
                  ) : (
                    <input
                      className="ob-task-name-input"
                      type="text"
                      placeholder="Task name"
                      value={task.label}
                      onChange={(e) => updateTask(i, { label: e.target.value })}
                    />
                  )}
                  <div className="ob-task-inputs">
                    <div className="ob-task-field">
                      <span className="ob-task-field-label">Hours</span>
                      <input
                        className="ob-task-input"
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={task.hours}
                        onChange={(e) =>
                          updateTask(i, {
                            hours: Math.max(0.5, parseFloat(e.target.value) || 0.5),
                          })
                        }
                      />
                    </div>
                    <div className="ob-task-field">
                      <span className="ob-task-field-label">Flat Rate ($)</span>
                      <input
                        className="ob-task-input"
                        type="number"
                        min={0}
                        step={5}
                        value={task.flatRate}
                        onChange={(e) =>
                          updateTask(i, {
                            flatRate: Math.max(0, parseInt(e.target.value) || 0),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="ob-task-add" onClick={addTask}>
              + Add Another Task Type
            </button>
          </div>
        );

      // ── Step 7 — Activation Check ──────────────────────────────────
      case 7:
        return (
          <div className="ob-card">
            <h2 className="ob-card-title">Let&apos;s test your connection</h2>
            <p className="ob-card-desc">
              Run a quick check to confirm Dax can receive calls and access your
              account settings.
            </p>
            <div className="ob-test-center">
              {testState === "idle" && (
                <button
                  type="button"
                  className="ob-test-btn"
                  onClick={runTestCall}
                >
                  Run Test Call
                </button>
              )}

              {testState === "running" && (
                <button type="button" className="ob-test-btn" disabled>
                  <Spinner size="sm" />
                  Testing…
                </button>
              )}

              {testState === "done" && (
                <>
                  <div className="ob-success-wrap">
                    <div className="ob-success-icon">
                      <CheckIcon />
                    </div>
                    <p className="ob-success-text">
                      Connection confirmed! Dax is ready.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ob-complete-btn"
                    onClick={completeSetup}
                  >
                    Complete Setup →
                  </button>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="ob-page">
      <div className="ob-container">

        <div className="ob-logo">
          <Logo size="sm" />
        </div>

        <div className="ob-progress">
          <span className="ob-progress-label">
            Step {step} of {TOTAL_STEPS}
          </span>
          <div className="ob-progress-track">
            <div
              className="ob-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {renderStep()}

        <div className="ob-nav">
          {step > 1 && (
            <button type="button" className="ob-nav-back" onClick={back}>
              ← Back
            </button>
          )}
          {step < TOTAL_STEPS && (
            <button
              type="button"
              className="ob-nav-next"
              onClick={next}
              disabled={!canProceed()}
            >
              Next →
            </button>
          )}
        </div>

      </div>

      {showToast && (
        <div className="ob-toast" role="status">
          Setup complete! Redirecting…
        </div>
      )}
    </div>
  );
}
