// Firebase Admin SDK — Task 11
// Server-side only. Dual init: on Vercel the FIREBASE_ADMIN_* env vars carry
// service-account credentials (cert); locally they're empty and we fall back
// to Application Default Credentials (`gcloud auth application-default login`).
// firebase-admin v14 is modular-only: getApps()/initializeApp() replaces the
// legacy `admin.apps` namespace.
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (privateKey) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Vercel stores the key with literal "\n" sequences
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    initializeApp({ credential: applicationDefault() });
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();
