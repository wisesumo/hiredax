"use client";

import "../../styles/auth.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Logo, Spinner } from "@/components/ui";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

function friendlyAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-email":
        return "Email or password is incorrect.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a few minutes and try again.";
      case "auth/network-request-failed":
        return "Connection problem. Check your network and try again.";
    }
  }
  return "Could not sign in. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Already signed in → straight to the dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err));
      setIsLoading(false);
    }
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
