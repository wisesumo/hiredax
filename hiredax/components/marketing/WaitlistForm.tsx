"use client";

export function WaitlistForm() {
  return (
    <div className="mkt-card">
      <h2 className="mkt-card-title">Join the Private Beta Waitlist</h2>
      <p className="mkt-card-desc">
        Our onboarding spaces are currently limited. Register your trades
        business below to secure your spot.
      </p>
      <button
        type="button"
        className="mkt-submit"
        // TODO: connect to Tally.so form trigger
        onClick={() => {}}
      >
        Request Private Access
      </button>
    </div>
  );
}
