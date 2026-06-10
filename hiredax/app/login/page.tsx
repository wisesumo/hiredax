"use client";

import "../../styles/auth.css";
import { useState } from "react";
import Link from "next/link";
import { Logo, Spinner } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // TODO Task 13: replace with
    // signInWithEmailAndPassword(auth, email, password)
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
    setError("Sign-in will be wired in Task 13.");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo-wrap">
          <Logo size="md" />
          <p className="auth-byline">by Amazing.ai</p>
        </div>

        <div className="auth-spacer" />

        {/* Form */}
        <form className="auth-form" onSubmit={handleSignIn} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className="auth-input"
              type="email"
              placeholder="you@yourbusiness.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button
            className="auth-btn"
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : "Sign In"}
          </button>

          {/* Inline error — always rendered, hidden when empty */}
          <p
            id="auth-error"
            className="auth-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        </form>

        <div className="auth-divider" role="separator" />

        <p className="auth-register">
          New to HireDax?{" "}
          <Link href="/onboarding" className="auth-register-link">
            Set up your account →
          </Link>
        </p>

        <p className="auth-footer">© 2026 AmazingDotAi, LLC</p>
      </div>
    </div>
  );
}
