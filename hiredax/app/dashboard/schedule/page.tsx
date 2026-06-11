"use client";

import "../../../styles/dashboard.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Spinner, StatusPill } from "@/components/ui";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Session } from "@/lib/types";

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Session[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const jobsQuery = query(
      collection(db, "sessions"),
      where("operatorId", "==", user.uid),
      where("status", "==", "booking_confirmed")
    );
    const unsubscribe = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const rows = snapshot.docs.map((d) => {
          // Firestore returns untyped DocumentData; sessions are only ever
          // written with the Session shape (seed script + agent + portal).
          const data = d.data() as Omit<Session, "id">;
          return { ...data, id: d.id };
        });
        rows.sort(
          (a, b) =>
            (b.createdAt ? b.createdAt.toMillis() : 0) -
            (a.createdAt ? a.createdAt.toMillis() : 0)
        );
        setJobs(rows);
        setError("");
      },
      () => setError("Could not load the schedule. Check your connection and refresh.")
    );
    return unsubscribe;
  }, [user]);

  const loading = authLoading || (user !== null && jobs === null && !error);

  return (
    <div className="db-page">
      <section className="db-schedule-section" aria-label="Upcoming jobs">
        <h1 className="db-schedule-title">Upcoming Jobs</h1>

        {loading && (
          <div className="db-loading-wrap" role="status" aria-label="Loading schedule">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <div className="db-error-card" role="alert">{error}</div>
        )}

        {!loading && !error && (jobs ?? []).map((job) => (
          <div key={job.id} className="db-job-card">
            {/* LEFT — date + time (V1 static booking window) */}
            <div className="db-job-date">
              <span className="db-job-date-label">Today</span>
              <span className="db-job-date-time">2:00–4:00 PM</span>
            </div>

            {/* CENTER — customer + phone */}
            <div className="db-job-info">
              <div className="db-job-info-top">
                <span className="db-job-customer">{job.customerName}</span>
                <StatusPill status={job.status} />
              </div>
              <span className="db-job-address">{job.customerPhone}</span>
            </div>

            {/* RIGHT — action buttons */}
            <div className="db-job-actions">
              <a
                href={`tel:${job.customerPhone}`}
                className="db-job-btn db-job-btn--nav"
                aria-label={`Call ${job.customerName}`}
              >
                📞 Call
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

        {!loading && !error && (jobs ?? []).length === 0 && (
          <div className="db-empty-card" role="status">
            No upcoming jobs. New bookings appear here.
          </div>
        )}
      </section>
    </div>
  );
}
