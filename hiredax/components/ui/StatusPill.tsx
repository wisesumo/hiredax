import type { SessionStatus } from "@/lib/types";

const STATUS_LABELS: Record<SessionStatus, string> = {
  call_active: "Call Active",
  link_sent: "Link Sent",
  photos_uploading: "Uploading",
  photos_complete: "Photos Ready",
  analysis_running: "Analyzing",
  pending_approval: "Pending Approval",
  quote_approved: "Quote Approved",
  quote_delivered: "Quote Delivered",
  booking_confirmed: "Booking Confirmed",
  work_order_signed: "Work Order Signed",
  job_complete: "Job Complete",
  rated: "Rated",
};

type ColorSet = { bg: string; color: string };

function getColors(status: SessionStatus): ColorSet {
  switch (status) {
    case "call_active":
    case "link_sent":
    case "photos_uploading":
    case "photos_complete":
      return { bg: "var(--color-navy)", color: "var(--color-bone)" };
    case "analysis_running":
    case "pending_approval":
      return { bg: "var(--color-stone-subtle)", color: "var(--color-stone)" };
    default:
      return { bg: "var(--color-green-light)", color: "#2D7A22" };
  }
}

const pillBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-xs)",
  fontWeight: 600,
  letterSpacing: "var(--tracking-wider)",
  textTransform: "uppercase",
  borderRadius: "var(--radius-full)",
  padding: "3px 8px",
  whiteSpace: "nowrap",
  lineHeight: 1.4,
};

interface StatusPillProps {
  status?: SessionStatus;
  isLive?: boolean;
}

export function StatusPill({ status, isLive }: StatusPillProps) {
  if (isLive) {
    return (
      <span
        className="badge-live"
        style={{
          ...pillBase,
          background: "var(--color-green-light)",
          color: "#2D7A22",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: "var(--radius-full)",
            background: "#2D7A22",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        Dax is on
      </span>
    );
  }

  if (!status) return null;

  const { bg, color } = getColors(status);

  return (
    <span style={{ ...pillBase, background: bg, color }}>
      {STATUS_LABELS[status]}
    </span>
  );
}
