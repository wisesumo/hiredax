// Firebase Admin SDK — Task 11
// Server-side only. Uses Application Default Credentials (configured via
// `gcloud auth application-default login`) — no service account JSON.
// firebase-admin v14 is modular-only: getApps()/initializeApp() replaces the
// legacy `admin.apps` namespace, with identical no-arg ADC behavior.
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

if (!getApps().length) {
  initializeApp();
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();
