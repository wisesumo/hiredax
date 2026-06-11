/**
 * Seed script — creates the demo operator (Firebase Auth + Firestore doc)
 * and 3 demo sessions so judges land on a populated dashboard.
 *
 * Run with: npm run seed
 * Auth: Application Default Credentials (gcloud) — no service account JSON.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local without adding a dotenv dependency. The file lives at the
// workspace root (hiredax/.env.local is a symlink to it).
function loadEnvLocal(): void {
  const candidates = [
    resolve(__dirname, "..", ".env.local"),
    resolve(__dirname, "..", "..", ".env.local"),
  ];
  for (const path of candidates) {
    let raw: string;
    try {
      raw = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      const key = match[1];
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      // Empty values would shadow gcloud ADC (e.g. GOOGLE_APPLICATION_CREDENTIALS)
      if (!value) continue;
      if (!(key in process.env)) process.env[key] = value;
    }
    return;
  }
  throw new Error(".env.local not found next to hiredax/ or at the workspace root");
}

async function main(): Promise<void> {
  loadEnvLocal();

  const password = process.env.DEMO_OPERATOR_PASSWORD;
  const email = process.env.DEMO_OPERATOR_EMAIL ?? "demo@hiredax.com";
  if (!password) {
    throw new Error("DEMO_OPERATOR_PASSWORD is not set in .env.local");
  }

  // Imported after env load so firebase-admin initializes with the right project.
  const { adminAuth, adminDb } = await import("../lib/firebase-admin");
  const { FieldValue } = await import("firebase-admin/firestore");

  // 1. Demo operator auth user (skip silently if it already exists)
  let uid: string;
  try {
    const user = await adminAuth.createUser({ email, password });
    uid = user.uid;
    console.log(`Created auth user ${email} (${uid})`);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "auth/email-already-exists"
    ) {
      const existing = await adminAuth.getUserByEmail(email);
      uid = existing.uid;
      console.log(`Auth user ${email} already exists (${uid}) — skipping`);
    } else {
      throw err;
    }
  }

  // 2. Operator doc — doc id is the auth uid so dashboard queries match
  await adminDb.collection("operators").doc(uid).set(
    {
      uid,
      email,
      businessName: "Demo Hauling Co",
      phone: "+14045550123",
      plan: "pro",
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log(`Wrote operators/${uid}`);

  // 3. Three demo sessions
  const sessions = [
    {
      id: "demo-session-001",
      operatorId: uid,
      customerName: "Marcus Johnson",
      customerPhone: "+14045550199",
      status: "pending_approval",
      portalToken: "demo-token-001",
      photoUrls: [
        "https://placehold.co/400x300?text=Couch",
        "https://placehold.co/400x300?text=Mattress",
      ],
      analysisResult: {
        items: ["Sectional sofa", "Queen mattress", "Dresser"],
        volume_yd3: 4.2,
        confidence: 0.87,
        suggestedPrice: 285,
      },
      suggestedPrice: 285,
      approvedPrice: null,
    },
    {
      id: "demo-session-002",
      operatorId: uid,
      customerName: "Linda Park",
      customerPhone: "+14045550177",
      status: "quote_approved",
      portalToken: "demo-token-002",
      photoUrls: ["https://placehold.co/400x300?text=Appliances"],
      analysisResult: {
        items: ["Refrigerator", "Washing machine"],
        volume_yd3: 2.8,
        confidence: 0.91,
        suggestedPrice: 195,
      },
      suggestedPrice: 195,
      approvedPrice: 195,
    },
    {
      id: "demo-session-003",
      operatorId: uid,
      customerName: "Tony Rivera",
      customerPhone: "+14045550155",
      status: "booking_confirmed",
      portalToken: "demo-token-003",
      photoUrls: [],
      analysisResult: null,
      suggestedPrice: 150,
      approvedPrice: 150,
    },
  ];

  for (const session of sessions) {
    await adminDb
      .collection("sessions")
      .doc(session.id)
      .set({
        ...session,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    console.log(`Wrote sessions/${session.id} (${session.status})`);
  }

  console.log("\n--- Seed complete ---");
  console.log("Demo credentials for README / Devpost testing access:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("Portal tokens: demo-token-001, demo-token-002, demo-token-003");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
