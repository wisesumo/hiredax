"use client";

import "../../styles/auth.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Logo, Spinner } from "@/components/ui";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

function friendlySignupError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try signing in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/network-request-failed":
        return "Connection problem. Check your network and try again.";
    }
  }
  return "Could not create your account. Please try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
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

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid } = credential.user;

      // Store the full name on the auth profile for display elsewhere.
      if (fullName.trim()) {
        await updateProfile(credential.user, { displayName: fullName.trim() });
      }

      // Create the operator doc — uid is the doc id so dashboard queries match.
      await setDoc(doc(db, "operators", uid), {
        uid,
        email,
        businessName: "",
        phone: "",
        plan: "starter",
        createdAt: serverTimestamp(),
      });

      router.push("/onboarding");
    } catch (err) {
      setError(friendlySignupError(err));
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
        <form className="auth-form" onSubmit={handleSignUp} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-name">
              Full Name
            </label>
            <input
              id="signup-name"
              className="auth-input"
              type="text"
              placeholder="Jordan Rivera"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
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
            <label className="auth-label" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              className="auth-input"
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
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
            {isLoading ? <Spinner size="sm" /> : "Create Account"}
          </button>

          {/* Inline error — always rendered, hidden when empty */}
          <p
            id="signup-error"
            className="auth-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        </form>

        <div className="auth-divider" role="separator" />

        <p className="auth-register">
          Already have an account?{" "}
          <Link href="/login" className="auth-register-link">
            Sign in →
          </Link>
        </p>

        <p className="auth-footer">© 2026 AmazingDotAi, LLC</p>
      </div>
    </div>
  );
}
