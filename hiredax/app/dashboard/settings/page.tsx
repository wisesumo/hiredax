"use client";

import "../../../styles/dashboard.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const HOURS = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "22:00", label: "10:00 PM" },
];

function useToast() {
  const [visible, setVisible] = useState(false);
  function show() {
    setVisible(true);
    setTimeout(() => setVisible(false), 2000);
  }
  return { visible, show };
}

export default function SettingsPage() {
  const router = useRouter();
  const { operator, signOut } = useAuth();

  // Section 1 — Business Profile (hydrated from operators/{uid})
  const [companyName, setCompanyName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [openHour, setOpenHour] = useState("08:00");
  const [closeHour, setCloseHour] = useState("20:00");
  const profileToast = useToast();

  useEffect(() => {
    if (!operator) return;
    setCompanyName(operator.businessName);
    setBusinessPhone(operator.phone);
  }, [operator]);

  // Section 3 — Notifications
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const notifToast = useToast();

  // Section 4 — Sign Out
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className="db-page">
      <div className="db-settings-content">
        <h1 className="db-settings-title">Settings</h1>

        {/* ── Section 1: Business Profile ── */}
        <div className="db-settings-card">
          <h2 className="db-section-heading">Business Profile</h2>

          <div className="db-form-field">
            <label className="db-form-label" htmlFor="company-name">
              Company Name
            </label>
            <input
              id="company-name"
              className="db-settings-input"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
            />
          </div>

          <div className="db-form-field">
            <label className="db-form-label" htmlFor="business-phone">
              Business Phone
            </label>
            <input
              id="business-phone"
              className="db-settings-input"
              type="tel"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          <div className="db-form-field">
            <span className="db-form-label">Operating Hours</span>
            <div className="db-form-row">
              <select
                className="db-settings-select"
                value={openHour}
                onChange={(e) => setOpenHour(e.target.value)}
                aria-label="Opening time"
              >
                {HOURS.map((h) => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
              <select
                className="db-settings-select"
                value={closeHour}
                onChange={(e) => setCloseHour(e.target.value)}
                aria-label="Closing time"
              >
                {HOURS.map((h) => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="db-btn-row">
            <button
              className="db-save-btn"
              onClick={profileToast.show}
            >
              Save Changes
            </button>
            <span
              className={`db-inline-toast${profileToast.visible ? " db-inline-toast--visible" : ""}`}
              role="status"
              aria-live="polite"
            >
              ✓ Saved!
            </span>
          </div>
        </div>

        {/* ── Section 2: Call Forwarding ── */}
        <div className="db-settings-card">
          <h2 className="db-section-heading">Call Forwarding</h2>

          <div className="db-form-field">
            <label className="db-form-label" htmlFor="hiredax-number">
              HireDax System Number
            </label>
            <input
              id="hiredax-number"
              className="db-settings-input db-settings-input--readonly"
              type="tel"
              value="+1-404-DAX-LINE"
              readOnly
              aria-readonly="true"
            />
          </div>

          <div className="db-forwarding-box" role="note">
            <p className="db-forwarding-text">
              <strong>To activate:</strong> dial *72 + the number above from
              your business phone.
            </p>
            <p className="db-forwarding-text">
              <strong>To disable:</strong> dial *73.
            </p>
          </div>
        </div>

        {/* ── Section 3: Notifications ── */}
        <div className="db-settings-card">
          <h2 className="db-section-heading">Notifications</h2>

          <label className="db-notif-row">
            <input
              className="db-notif-checkbox"
              type="checkbox"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
            />
            <span className="db-notif-label">
              Push notifications for new estimates
            </span>
          </label>

          <label className="db-notif-row">
            <input
              className="db-notif-checkbox"
              type="checkbox"
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
            />
            <span className="db-notif-label">SMS backup alerts</span>
          </label>

          <div className="db-btn-row">
            <button
              className="db-save-btn"
              onClick={notifToast.show}
            >
              Save Preferences
            </button>
            <span
              className={`db-inline-toast${notifToast.visible ? " db-inline-toast--visible" : ""}`}
              role="status"
              aria-live="polite"
            >
              ✓ Saved!
            </span>
          </div>
        </div>

        {/* ── Section 4: Account ── */}
        <div className="db-settings-card">
          <h2 className="db-section-heading">Account</h2>
          <div>
            <button
              className="db-sign-out-btn"
              onClick={handleSignOut}
              disabled={signingOut}
              aria-label="Sign out of HireDax"
            >
              {signingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
