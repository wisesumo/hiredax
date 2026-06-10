import "../../../styles/dashboard.css";
import Link from "next/link";
import { StatusPill } from "@/components/ui";
import type { SessionStatus } from "@/lib/types";

interface JobEntry {
  token: string;
  customerName: string;
  address: string;
  dateLabel: string;
  dateLabelMuted: boolean;
  timeBlock: string;
  status: SessionStatus;
}

const JOBS: JobEntry[] = [
  {
    token: "session-demo-003",
    customerName: "David Chen",
    address: "142 Cascade Rd, Atlanta, GA 30311",
    dateLabel: "Today",
    dateLabelMuted: false,
    timeBlock: "2:00–4:00 PM",
    status: "booking_confirmed",
  },
  {
    token: "session-demo-004",
    customerName: "Tamara Reid",
    address: "87 Flat Shoals Ave, Atlanta, GA 30316",
    dateLabel: "Today",
    dateLabelMuted: false,
    timeBlock: "10:00 AM–12:00 PM",
    status: "booking_confirmed",
  },
  {
    token: "session-demo-005",
    customerName: "Jerome Patterson",
    address: "2241 Campbellton Rd, Fairburn, GA 30213",
    dateLabel: "Tomorrow",
    dateLabelMuted: true,
    timeBlock: "8:00–10:00 AM",
    status: "booking_confirmed",
  },
];

function mapsUrl(address: string) {
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

export default function SchedulePage() {
  return (
    <div className="db-page">
      <section className="db-schedule-section" aria-label="Upcoming jobs">
        <h1 className="db-schedule-title">Upcoming Jobs</h1>

        {JOBS.map((job) => (
          <div key={job.token} className="db-job-card">
            {/* LEFT — date + time */}
            <div className="db-job-date">
              <span
                className={`db-job-date-label${job.dateLabelMuted ? " db-job-date-label--muted" : ""}`}
              >
                {job.dateLabel}
              </span>
              <span className="db-job-date-time">{job.timeBlock}</span>
            </div>

            {/* CENTER — customer + address */}
            <div className="db-job-info">
              <div className="db-job-info-top">
                <span className="db-job-customer">{job.customerName}</span>
                <StatusPill status={job.status} />
              </div>
              <span className="db-job-address">{job.address}</span>
            </div>

            {/* RIGHT — action buttons */}
            <div className="db-job-actions">
              <a
                href={mapsUrl(job.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="db-job-btn db-job-btn--nav"
                aria-label={`Navigate to ${job.address}`}
              >
                📍 Navigate
              </a>
              <Link
                href="/dashboard"
                className="db-job-btn db-job-btn--detail"
                aria-label={`View details for ${job.customerName}`}
              >
                📋 Details
              </Link>
            </div>
          </div>
        ))}

        {/* Empty state — visible during QA */}
        <div className="db-empty-card" role="status">
          No upcoming jobs. New bookings appear here.
        </div>
      </section>
    </div>
  );
}
