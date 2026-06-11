/**
 * Vapi webhook — Task: voice tool-call handler.
 *
 * Vapi POSTs { message: { type: "tool-calls", toolCallList: [...] } } and
 * expects { results: [{ toolCallId, result }] } back. Three tools are
 * configured in the Vapi dashboard:
 *   - send_sight_link    → create session + SMS the portal link
 *   - check_photos_status → spoken-style progress report
 *   - read_approved_quote → EXPERT SEAL GATE: price only if quote_approved
 *
 * Uses the client Firebase SDK (same db instance as the frontend) — the
 * Admin SDK needs a service-account key, which org policy blocks on Vercel.
 * Firestore security rules permit these specific reads/writes.
 */
import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { randomUUID } from "crypto";
import { db } from "@/lib/firebase";

interface VapiToolCall {
  id: string;
  name?: string;
  arguments?: unknown;
  // Older payloads nest name/arguments under `function` (OpenAI-style)
  function?: { name?: string; arguments?: unknown };
}

interface VapiMessage {
  type?: string;
  toolCallList?: VapiToolCall[];
  toolCalls?: VapiToolCall[];
}

interface VapiWebhookBody {
  message?: VapiMessage;
}

interface ToolResult {
  toolCallId: string;
  result: string;
}

function parseArguments(raw: unknown): Record<string, unknown> {
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed !== null && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
    return {};
  }
  if (raw !== null && typeof raw === "object") {
    return raw as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Webhook-created sessions belong to the demo operator so they appear on the
// judge-facing dashboard. Looked up via the operators collection (doc id ==
// auth uid, written by the seed script) and cached across invocations.
let demoOperatorUid: string | null = null;
async function getDemoOperatorUid(): Promise<string> {
  if (demoOperatorUid) return demoOperatorUid;
  const email = process.env.DEMO_OPERATOR_EMAIL ?? "demo@hiredax.com";
  const snapshot = await getDocs(
    query(collection(db, "operators"), where("email", "==", email), limit(1))
  );
  if (snapshot.empty) {
    throw new Error(`No operator doc found for ${email}`);
  }
  demoOperatorUid = snapshot.docs[0].id;
  return demoOperatorUid;
}

async function sendSurgeSms(phone: string, body: string): Promise<void> {
  const accountId = process.env.SURGE_ACCOUNT_ID;
  const apiKey = process.env.SURGE_API_KEY;
  if (!accountId || !apiKey) {
    throw new Error("Surge credentials are not configured");
  }
  const response = await fetch(
    `https://api.surge.app/accounts/${accountId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation: { contact: { phone_number: phone } },
        body,
      }),
    }
  );
  if (!response.ok) {
    throw new Error(`Surge responded ${response.status}: ${await response.text()}`);
  }
}

async function handleSendSightLink(
  args: Record<string, unknown>
): Promise<string> {
  const customerPhone = asString(args.customer_phone);
  const customerName = asString(args.customer_name) || "there";
  if (!customerPhone) {
    return "I need the customer's phone number before I can send the photo link.";
  }

  const operatorId = await getDemoOperatorUid();
  const portalToken = randomUUID();
  const sessionRef = doc(collection(db, "sessions"));

  await setDoc(sessionRef, {
    id: sessionRef.id,
    operatorId,
    customerName,
    customerPhone,
    status: "link_sent",
    portalToken,
    photoUrls: [],
    analysisResult: null,
    suggestedPrice: null,
    approvedPrice: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hiredax.com";
  const portalUrl = `${appUrl}/portal/${portalToken}`;
  const smsBody =
    `Hi ${customerName}! Here's your HireDax photo link: ${portalUrl}\n` +
    "Snap 1-3 photos of the items and we'll have a price for you right away.";

  try {
    await sendSurgeSms(customerPhone, smsBody);
    console.log(
      `[vapi-webhook] send_sight_link session=${sessionRef.id} sms=sent phone=${customerPhone}`
    );
  } catch (err) {
    // An SMS hiccup must never stall the live call — the session exists and
    // the operator can hand the portal link over from the dashboard.
    console.error(
      `[vapi-webhook] send_sight_link session=${sessionRef.id} sms=FAILED`,
      err
    );
  }

  return (
    `The photo link is on its way to ${customerName}'s phone. ` +
    `Session ID is ${sessionRef.id} — use it to check photo status later.`
  );
}

async function handleCheckPhotosStatus(
  args: Record<string, unknown>
): Promise<string> {
  const sessionId = asString(args.session_id);
  if (!sessionId) {
    return "I need the session ID to check on the photos.";
  }
  const snapshot = await getDoc(doc(db, "sessions", sessionId));
  console.log(`[vapi-webhook] check_photos_status session=${sessionId}`);
  if (!snapshot.exists()) {
    return "I couldn't find that session. Double-check the session ID.";
  }
  const status = asString(snapshot.get("status"));
  switch (status) {
    case "photos_complete":
    case "analysis_running":
      return "Photos received, analysis is running. The estimate will be ready shortly.";
    case "pending_approval":
      return "Analysis is complete and the estimate is awaiting operator approval.";
    case "quote_approved":
    case "quote_delivered":
    case "booking_confirmed":
    case "work_order_signed":
    case "job_complete":
    case "rated":
      return "Analysis is complete and the quote has been approved by the operator.";
    default:
      return "Still waiting on photos from the customer.";
  }
}

async function handleReadApprovedQuote(
  args: Record<string, unknown>
): Promise<string> {
  const sessionId = asString(args.session_id);
  if (!sessionId) {
    return "I need the session ID to look up the quote.";
  }
  const snapshot = await getDoc(doc(db, "sessions", sessionId));
  console.log(`[vapi-webhook] read_approved_quote session=${sessionId}`);
  if (!snapshot.exists()) {
    return "I couldn't find that session, so no quote is available yet.";
  }

  // EXPERT SEAL GATE — constitutional constraint. The price is released only
  // when the operator has explicitly approved it. No exceptions, ever.
  const status = asString(snapshot.get("status"));
  if (status !== "quote_approved") {
    console.log(
      `[vapi-webhook] read_approved_quote session=${sessionId} GATE_HELD status=${status}`
    );
    return "The quote hasn't been approved by the operator yet. Let the caller know we're double-checking the numbers and will have their price momentarily.";
  }

  const approvedPrice: unknown = snapshot.get("approvedPrice");
  if (typeof approvedPrice !== "number") {
    console.error(
      `[vapi-webhook] read_approved_quote session=${sessionId} approved but approvedPrice missing`
    );
    return "The quote was approved but the price isn't on file yet. Ask the caller to hold one moment.";
  }

  console.log(
    `[vapi-webhook] read_approved_quote session=${sessionId} GATE_RELEASED price=${approvedPrice}`
  );
  return `The operator-approved price is $${approvedPrice}. You may now share this price with the caller.`;
}

async function dispatchToolCall(call: VapiToolCall): Promise<ToolResult> {
  const name = call.name ?? call.function?.name ?? "";
  const args = parseArguments(call.arguments ?? call.function?.arguments);
  console.log(
    `[vapi-webhook] tool=${name} session=${asString(args.session_id) || "n/a"}`
  );

  let result: string;
  try {
    switch (name) {
      case "send_sight_link":
        result = await handleSendSightLink(args);
        break;
      case "check_photos_status":
        result = await handleCheckPhotosStatus(args);
        break;
      case "read_approved_quote":
        result = await handleReadApprovedQuote(args);
        break;
      default:
        console.error(`[vapi-webhook] unknown tool: ${name}`);
        result = "That tool isn't available.";
    }
  } catch (err) {
    console.error(`[vapi-webhook] tool=${name} failed`, err);
    result = "Something went wrong on our end. Ask the caller to hold one moment.";
  }
  return { toolCallId: call.id, result };
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: VapiWebhookBody;
  try {
    body = (await request.json()) as VapiWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body.message;
  if (message?.type !== "tool-calls") {
    // Status updates, transcripts, end-of-call reports — acknowledge and move on.
    return NextResponse.json({ ok: true });
  }

  const toolCalls = message.toolCallList ?? message.toolCalls ?? [];
  const results = await Promise.all(toolCalls.map(dispatchToolCall));
  return NextResponse.json({ results });
}
