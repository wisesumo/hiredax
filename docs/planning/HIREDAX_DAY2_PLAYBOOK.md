# HireDax — Day 2 Operational Playbook
## Tuesday, June 9, 2026 | 8:00 AM → End of Day

> **Hard deadline: Thursday, June 11, 2026 at 5:00 PM PST (8:00 PM EST)**
> **Days remaining including today: 3 days**
>
> **Today's goal:** The full **Golden Thread** runs end-to-end on real services.
> By tonight: a real call → real SMS → real photos → grounded estimate →
> operator approval → price read back → booking confirmed → signature.
> This is the loop you will record on Day 3. By midnight tonight you have a
> working MVP — nothing left to *build* for the demo, only polish and record.
>
> **What "done" looks like at EOD:**
> - Both UIs are driven by live Firestore (no mock data).
> - The ADK **multi-agent** system (EstimatorAgent + GroundingAgent) is live on Cloud Run.
> - A full manual call flow completes without errors.
>
> **Confidence anchor:** You ended Day 1 with every screen visible and the
> EstimatorAgent talking locally. Today you connect the wires. Each block
> lights up another segment of the Golden Thread until the whole loop glows.

---

## Prerequisites Check — Before 8:00 AM

Confirm Day 1 finished clean. If any of these is missing, do it first:

| Need | How to confirm |
|---|---|
| All 10 frontend screens build | `cd hiredax && npm run dev` → walk every route |
| EstimatorAgent talks locally | `cd dax-agent && adk web` → send a test message |
| Day 1 committed + pushed | `git log --oneline -1` shows the Day 1 commit |
| Firebase project exists | console.firebase.google.com → `hiredax-prod` is there |
| Service account JSON downloaded | You have the Firebase Admin private key file |
| Google Cloud project + billing | `gcloud config get-value project` returns your project |
| Vertex AI API enabled | `gcloud services list --enabled | grep aiplatform` |

**If you did NOT create the Firebase project on Day 1**, do the Day 1 playbook's
"Evening Extension — Firebase project" steps now (≈10 min) before continuing.

**Credentials you must have in hand today (real values, not placeholders):**
```
# Firebase client (NEXT_PUBLIC_*)        — from Firebase console → Project Settings
# Firebase admin (CLIENT_EMAIL, PRIVATE_KEY) — from the service account JSON
# SURGE_API_KEY, SURGE_ACCOUNT_ID         — from Day 1 pre-flight
# VAPI_API_KEY, VAPI_ASSISTANT_ID, VAPI_PHONE_NUMBER_ID — from Day 1 pre-flight
# GOOGLE_CLOUD_PROJECT                     — your GCP project id
# GOOGLE_APPLICATION_CREDENTIALS           — path to the service account JSON
```

---

## The Two-Track Plan — Why Today Is Fast

Day 2 has two independent workstreams that do **not** block each other until the
end-to-end test. Run them in parallel across your two terminals:

- **Track A (Terminal 1 + Claude Code) — Frontend wiring.** Firebase setup,
  portal → Firestore, dashboard → Firestore, integration test. Tasks 11–14.
- **Track B (Terminal 2 + Claude Code, dax-agent/) — Agent.** Real tool
  implementations, GroundingAgent, MCP verify, Cloud Run deploy. Tasks 16–17.

The two tracks **converge** at Task 18 (Vapi webhook wires the deployed agent to
the frontend) and Task 20 (the full Golden Thread test).

> **Fastest-path rule:** Do Track A Tasks 11–14 first thing (they unblock the
> visible app and the seed data the agent will read). Kick off Track B tool work
> in Terminal 2 during the Firebase install/propagation waits. Verify the
> multi-agent delegation **locally** (16b) BEFORE deploying (17) — never deploy
> an unverified agent graph; a redeploy costs you 5–8 minutes each time.

---

## VS Code Layout — Same as Day 1

- **Terminal 1 (left):** `hiredax/` — Claude Code + npm
- **Terminal 2 (right):** `dax-agent/` — Python / `uv` / `adk` / `gcloud`
- **Browser tabs pinned:** `localhost:3000` (app), `localhost:8080` (adk web),
  Firebase console, Google Cloud console.

---

## 8:00 AM — Session Starter Prompt

Paste this into Claude Code to restore full context for Day 2:

```
Read CLAUDE.md, HIREDAX_SSD_v4.md, and HIREDAX_BUILD_PLAN_v6.md before
doing anything else. Confirm by summarizing the Expert Seal Gate and the
multi-agent architecture (EstimatorAgent + GroundingAgent) in 2 sentences.

Today is Tuesday June 9, 2026 — Day 2. All 10 frontend screens are built
with mock data and the EstimatorAgent talks locally. Today we wire real
services: Firestore on both UIs, real ADK tools, the GroundingAgent, and
a Cloud Run deploy.

For Next.js tasks I am in hiredax-workspace/hiredax/.
For Python ADK tasks I am in hiredax-workspace/dax-agent/.
I will tell you which directory each task targets. Build to the SSD v4
acceptance criteria exactly.
```

Wait for confirmation before starting Task 11.

---

# TRACK A — FRONTEND WIRING (Terminal 1 / Claude Code)

## 8:10 AM — Task 11: Firebase Setup (incl. Auth) ⚙️
**Duration: 30 min**

### First, put your real credentials in `hiredax/.env.local`:
```bash
cd hiredax
cp .env.example .env.local   # if not already present
# Open .env.local and fill in EVERY real value, including
# DEMO_OPERATOR_EMAIL / DEMO_OPERATOR_PASSWORD. Leave nothing blank.
```

### Paste this prompt:

```
TASK 11 — Firebase Setup (incl. Auth) (directory: hiredax/)

Read HIREDAX_SSD_v4.md sections 1.8, 1.8a, and Task 11.

1. lib/firebase.ts — client SDK:
   Initialize from NEXT_PUBLIC_FIREBASE_* env vars.
   Export: app, auth, db (Firestore), storage.
   Set auth persistence to browserLocalPersistence (sessions survive reloads).

2. lib/firebase-admin.ts — server Admin SDK:
   Initialize from FIREBASE_ADMIN_PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY.
   Handle the PRIVATE_KEY newline escaping (replace \\n with real newlines).
   Export: adminApp, adminDb, adminAuth.

3. lib/auth-context.tsx — AuthProvider:
   onAuthStateChanged → expose { operator, loading, signOut }. On auth change,
   fetch operators/{uid} and expose as `operator`. Wrap the app in the root layout.

4. firestore.rules:
   - operators/{operatorId}: read/write if request.auth.uid === operatorId
   - sessions/{token}: read if true (public via magic link),
     write if request.auth != null

5. scripts/seed.ts — Firestore seed script (creates the JUDGE demo account):
   - Create the DEMO OPERATOR Firebase Auth user via Admin SDK using
     DEMO_OPERATOR_EMAIL / DEMO_OPERATOR_PASSWORD, onboardingComplete: true.
   - Write operators/{uid} using that auth uid as the doc id (base values from
     lib/mock-data.ts MOCK_OPERATOR).
   - Write 3 sessions with operatorId === that uid (so the dashboard query
     returns them). Ensure EVERY optional field has a concrete default value
     (the Firestore MCP has a known null-field bug — no undefined/null fields).
   - Print the demo credentials at the end (for the README / Devpost testing field).

6. npm install firebase firebase-admin

After building, run: npx ts-node scripts/seed.ts
Confirm the demo auth user exists (Firebase console → Authentication) and that
1 operator + 3 sessions appear in Firestore, all owned by the demo uid.
```

### Verify:
- Firebase console → Authentication → the demo operator user exists.
- Firestore → `operators` (1 doc, id = demo uid) + `sessions` (3 docs, operatorId = demo uid).

> **While the seed runs and you confirm in console, switch to Terminal 2 and
> kick off Track B Task 16 (below). Come back here when the seed is confirmed.**

---

## 8:35 AM — Task 12: Wire Portal to Firestore 🔌
**Duration: 40 min | Visual win: ✅ Live portal**

### Paste this prompt:

```
TASK 12 — Wire Customer Portal to Firestore (directory: hiredax/)

Read HIREDAX_SSD_v4.md sections 1.13 and Task 12.

Replace mock data in app/portal/[token]/page.tsx with live Firestore:
1. Fetch session by token: doc(db, "sessions", token).
2. onSnapshot listener — portal re-renders on every status change.
3. Photo upload:
   - On file select: compress each image to <= 2MB via a canvas resize.
   - Upload to Storage at sessions/{token}/photos/{filename}.
   - Append the download URL to session.photos.
   - First photo → status photos_uploading; all done → photos_complete.
4. Signature: canvas → blob → Storage sessions/{token}/signature.png,
   write signatureUrl, set status work_order_signed.
5. Rating: write { rating, feedbackNote } to the session doc.
6. REMOVE the dev-only state switcher dropdown.
7. Loading state during initial fetch; "Session not found" card on bad token.

Test against the seeded session token session-demo-001.
```

### Verify:
`localhost:3000/portal/session-demo-001` loads the seeded session live. Change
the status field in the Firebase console and watch the portal react within ~2s.

---

## 9:15 AM — Task 13: Wire Login + Auth Guard + Dashboard 🔌
**Duration: 50 min | Visual win: ✅ Real login → live dashboard (judge flow works)**

### Paste this prompt:

```
TASK 13 — Wire Login + Auth Guard + Dashboard to Firestore (directory: hiredax/)

Read HIREDAX_SSD_v4.md sections 1.8, 1.8a, 1.12, and Task 13.

PART A — Make login REAL (demo-critical):
1. Replace the Task 9 handleSignIn() stub in app/login/page.tsx with
   signInWithEmailAndPassword(auth, email, password).
   On success: read operators/{uid}; if onboardingComplete === false →
   router.push('/onboarding'), else → '/dashboard'.
   On error: friendly inline message (never a raw Firebase error code).
2. Auth guard:
   - middleware.ts: logged-out requests for /dashboard/* → /login.
   - dashboard layout uses AuthProvider: spinner while loading; no operator →
     /login; logged-in on /login → /dashboard.
3. Sign Out control in Settings → signOut() → /login.

PART B — Wire dashboard to Firestore:
4. app/dashboard/page.tsx — Expert Seal feed: query sessions where
   operatorId == auth uid, orderBy updatedAt desc, onSnapshot.
5. Approve button → POST /api/quote/approve { sessionToken, approvedPrice };
   card updates via onSnapshot.
6. schedule/page.tsx — sessions with status booking_confirmed or later.
7. settings/page.tsx — read/write operators/{uid}; include Sign Out.
8. Onboarding — write each step; set onboardingComplete on finish → /dashboard.
9. Loading skeletons + empty-state card when no sessions.

Also build the API routes from SSD v4 section 1.8 (stub the Vapi forwarder for
now — wired fully in Task 18):
- POST /api/quote/approve (validate pending_approval → write approvedPrice →
  quote_approved via Admin SDK)
- GET /api/session/[token] (returns session JSON for the portal)
```

### Verify (login is demo-critical — all must pass):
- Sign in with the seeded demo credentials → lands on a populated dashboard.
- Wrong credentials → friendly inline error.
- Visiting `/dashboard` logged out → redirects to `/login`.
- Refresh `/dashboard` logged in → no bounce to login (persistence).
- Sign Out → returns to `/login` and re-protects the dashboard.
- Dashboard shows only the demo operator's 3 sessions (operatorId == uid).

---

## 9:55 AM — Task 14: Login Flow + Integration Test ✅
**Duration: 25 min | Visual win: ✅ Judge flow + real-time sync both verified**

First, the JUDGE FLOW (demo-critical), no code:
1. Marketing site (`/`) → tap **Operator Login** → `/login`.
2. Sign in with the seeded demo credentials → lands on the populated dashboard.
3. Refresh `/dashboard` → stays logged in (persistence).
4. Open `/dashboard` in a private window (logged out) → redirects to `/login`.
5. Sign Out from Settings → returns to `/login`.

Then REAL-TIME SYNC, two tabs:
6. Logged in: Tab 1 `localhost:3000/dashboard`, Tab 2 `localhost:3000/portal/session-demo-001`.
7. In Firebase console, set session-demo-001 status → `pending_approval`.
8. Confirm the dashboard card shows the approve panel.
9. Tap **Approve & Release Quote** on the dashboard.
10. Confirm: dashboard card → quote_approved AND portal tab → proposal card
    with the "Preliminary Visual Estimate Only" disclaimer — both within ~2s.

**Report pass/fail for each step. This proves the judge login path AND the
real-time spine both work.**

> Track A is now done through Task 14. The frontend is fully live on Firestore.
> Move to Terminal 2 and finish Track B (you should already have Task 16
> underway from the 8:35 AM hand-off).

---

# TRACK B — ADK MULTI-AGENT (Terminal 2 / Claude Code, dax-agent/)

> Start Task 16 in Terminal 2 during the Task 11 seed wait (~8:35 AM). The
> times below are nominal; run them whenever Track A is waiting on you.

## Task 16: MCP + Tool Implementation 🐍🔌
**Duration: 45 min | Visual win: ✅ Agent calls real Surge + Gemini**

### First, fill `dax-agent/.env` with real values:
```bash
cd dax-agent
# Edit .env — GOOGLE_CLOUD_PROJECT, SURGE_API_KEY, SURGE_ACCOUNT_ID,
# NEXT_PUBLIC_APP_URL, GOOGLE_APPLICATION_CREDENTIALS (path to SA json)
```

### Paste this prompt (tell Claude Code you are in dax-agent/):

```
TASK 16 — MCP + Tool Implementation (directory: dax-agent/)

Read HIREDAX_SSD_v4.md section 1.9 and Task 16.

1. dax_agent/tools/send_sight_link.py — implement EXACTLY from SSD v4 1.9.
   POST to Surge.app with the session token + phone. Returns {success,url,phone}.

2. dax_agent/tools/analyze_photos.py — implement EXACTLY from SSD v4 1.9.
   Init Vertex AI from env, build Part objects from photo_urls, call
   gemini-2.5-flash with VISION_PROMPT, parse JSON → AnalysisResult dict.

3. Verify the McpToolset Firestore connection:
   - GOOGLE_APPLICATION_CREDENTIALS is set in .env.
   - In adk web, ask: "Check the status of session session-demo-001"
   - EstimatorAgent should call firestore_get_document; confirm it shows in
     the trace panel and returns the seeded session.

No hardcoded secrets — everything from environment.
```

### Verify:
- `send_sight_link` delivers a real SMS to your test phone.
- `analyze_photos` returns valid AnalysisResult JSON for 2 Storage photo URLs.
- `firestore_get_document` MCP call appears in the adk web trace and reads
  the seeded session (proves the agent shares Firestore with the frontend).

---

## Task 16b: GroundingAgent + Agent-to-Agent Wiring 🐍🔌
**Duration: 45 min | Visual win: ✅ Multi-agent delegation in the trace panel**
**This is the competition-critical task. Verify locally before any deploy.**

### Paste this prompt:

```
TASK 16b — GroundingAgent Sub-Agent + A2A Wiring (directory: dax-agent/)

Read HIREDAX_SSD_v4.md section 1.9 (GroundingAgent code) and Task 16b.

1. Create dax_agent/agents/grounding_agent.py EXACTLY from SSD v4 1.9.
   It is an LlmAgent (gemini-2.5-flash) whose only tool is the ADK built-in
   google_search. It returns a pricing-context JSON.

2. Ensure dax_agent/agents/__init__.py exports grounding_agent.

3. Update dax_agent/agent.py to the FULL multi-agent version from SSD v4 1.9:
   - from google.adk.tools import AgentTool
   - from .agents.grounding_agent import grounding_agent
   - get_pricing_context = AgentTool(agent=grounding_agent)
   - Add get_pricing_context to root_agent.tools (before analyze_photos)
   - Use the updated SYSTEM_PROMPT that includes call-flow step 5b
     (call get_pricing_context before analyze_photos)
   - Remove the Day 1 "# Day 2: add GroundingAgent here" placeholder.

4. DO NOT build a Vertex AI Search datastore. google_search grounding is
   sufficient for the demo. Leave the Vertex AI Search note as a comment only.

Then verify locally in adk web.
```

### Verify (the delegation gate — do not skip):
In `adk web`, send:
```
I need a couch and a mattress removed in Atlanta, GA 30311.
```
In the **Trace panel**, confirm this chain appears:
- [ ] EstimatorAgent calls `get_pricing_context`
- [ ] control passes to `grounding_agent`
- [ ] `grounding_agent` calls `google_search`
- [ ] a pricing-context JSON returns up to EstimatorAgent

**If the chain does not appear, fix it now — never deploy an unverified graph.**

**Multi-agent collaboration is live locally. ✅**

---

## Task 17: Deploy Multi-Agent System to Cloud Run 🐍⚙️
**Duration: 30 min**

### Paste this prompt (or run manually in Terminal 2):

```
TASK 17 — Deploy dax-agent to Cloud Run (directory: dax-agent/)

Read HIREDAX_SSD_v4.md Task 17.

Both EstimatorAgent and GroundingAgent ship in ONE container — one ADK app.

  gcloud config set project YOUR_PROJECT_ID
  agents-cli deploy --project YOUR_PROJECT_ID --region us-central1 \
    --min-instances 1

After deploy, retrieve the URL:
  gcloud run services describe dax-agent --region us-central1 \
    --format="value(status.url)"

Save it as DAX_AGENT_URL in hiredax/.env.local.

Verify: POST to {DAX_AGENT_URL}/run with a grounding-triggering message.
Confirm the response returns AND the grounding_agent delegation appears in
Google Cloud Logging.
```

### Verify:
- Cloud Run service is **ACTIVE**.
- POST to `/run` returns a valid agent response.
- `grounding_agent` delegation visible in Cloud Logging.
- `--min-instances 1` is set (prevents cold-start stalls during demo recording).
- `DAX_AGENT_URL` is in `hiredax/.env.local`.

> **Why `--min-instances 1`:** a cold Cloud Run start adds 5–10s to the first
> call. During a live demo recording that reads as a frozen agent. Keeping one
> warm instance costs pennies and removes the risk entirely.

**Multi-agent system live on Cloud Run. ✅**

---

# CONVERGENCE — WIRE THE TRACKS TOGETHER

## 11:30 AM — Task 18: Vapi Webhook → ADK Forwarder 🔌
**Duration: 25 min | (Terminal 1 / Claude Code, hiredax/)**

### Paste this prompt:

```
TASK 18 — Vapi Webhook → ADK Forwarder (directory: hiredax/)

Read HIREDAX_SSD_v4.md section 1.8 and Task 18.

Implement app/api/vapi/webhook/route.ts:
- call.started: create a Firestore session via Admin SDK
  (status call_active, customerPhone from call metadata, a fresh token).
- tool.called: forward the payload to ${DAX_AGENT_URL}/run with the session
  context (app_name 'dax-app', user_id + session_id = session token,
  new_message = JSON.stringify(payload)).
- call.ended: if status is still call_active, mark the session abandoned.

Confirm POST /api/quote/approve and GET /api/session/[token] from Task 13
are complete (build them now if stubbed).
```

### Then connect Vapi to your deployed frontend:
1. In app.vapi.ai → your assistant → set the **server/webhook URL** to your
   deployed `…/api/vapi/webhook` (or your tunnel URL during local testing).
2. Paste the Vapi system prompt from **SSD v4 section 1.10** into the assistant.
3. Confirm the assistant's model is **Gemini 3.1 Flash Live** and your phone
   number is assigned to the assistant.

> **Local testing tip:** to test the webhook before the Vercel deploy, expose
> `localhost:3000` with a tunnel (e.g. `npx localtunnel --port 3000`) and point
> Vapi at the tunnel URL temporarily. You'll switch to the real Vercel URL on
> Day 3 (Task 24).

---

## 11:55 AM — Task 19: FCM Push Notifications 🔌
**Duration: 25 min | Visual win: ✅ Push notification fires**

### Paste this prompt:

```
TASK 19 — FCM Push Notifications (directory: hiredax/)

Read HIREDAX_SSD_v4.md section 1.12 and Task 19.

1. Request FCM permission on dashboard load; save the FCM token to the
   operator's Firestore doc.
2. When a session transitions to pending_approval (detect via a Firestore
   trigger, the approve API, or the analyze step), send an FCM push:
   title "Estimate Ready", body "{customerName} — tap to approve".
3. Fallback: if FCM permission is denied, play an audio chime via the
   existing onSnapshot listener when a card enters pending_approval.
```

### Verify:
Drive a session to `pending_approval` (Firebase console or a test call) and
confirm the operator device buzzes within ~5s, or the chime fires.

---

## 12:20 PM — LUNCH (30 min)

You are minutes from the whole loop closing. Eat. Let Cloud Run stay warm.

---

## 12:50 PM — Task 20: End-to-End Golden Thread Test ✅
**Duration: 60 min | Visual win: ✅ THE FULL LOOP**

This is the rehearsal for the Day 3 recording. Run it on real services with a
real phone. Walk all 12 steps of the Golden Thread (BUILD_PLAN_v6):

1. **Call** your Vapi number from a real phone → Dax answers (warm greeting,
   asks name + city/zip).
2. Dax **sends the SMS Sight Link** via Surge mid-call.
3. Open the link on a second phone → the **PWA loads**.
4. **Take 1–3 photos** and upload → Dax says "analyzing now."
5. EstimatorAgent calls **`get_pricing_context`** → GroundingAgent runs
   `google_search` (confirm in Cloud Logging).
6. EstimatorAgent calls **`analyze_photos`** (Gemini Vision) using the grounded
   pricing context.
7. Session → `pending_approval`; **FCM push** buzzes the operator phone.
8. On the dashboard, the **Expert Seal card** shows the itemized breakdown.
9. Tap **Approve & Release Quote** → status → `quote_approved`.
10. Dax **confirms quote_approved via Firestore MCP** and **reads the price
    back** to the live caller, then offers the 2–4 PM window.
11. Caller accepts → EstimatorAgent **writes `booking_confirmed`** via MCP.
12. Portal shows the **signature pad** → sign → `work_order_signed` →
    rating screen.

### Acceptance criteria (all must pass):
- [ ] SMS arrives within ~5s of the tool call
- [ ] GroundingAgent delegation appears in Cloud Logging on every call
- [ ] No price is ever spoken before status == quote_approved (Expert Seal gate)
- [ ] The price Dax reads back matches the operator-approved price exactly
- [ ] FCM push fires within ~5s of pending_approval
- [ ] Signature saves and the session reaches work_order_signed
- [ ] Total call under ~3 minutes

> **If a step fails, fix it today.** Day 3 is for polish and recording, not
> debugging core flow. Common fixes are in Troubleshooting below.

**THE GOLDEN THREAD RUNS END TO END. ✅ Working MVP complete.**

---

## 1:50 PM — Commit the Working MVP 📦
**Duration: 10 min — non-negotiable**

```bash
# Terminal 1, from hiredax-workspace/ root
git add .
git status   # confirm hiredax/ + dax-agent/ changes; NO .env files staged

git commit -m "Day 2 (Jun 9): Golden Thread working end-to-end

Frontend (Next.js):
- Firebase client + admin SDK, Auth (browserLocalPersistence), security rules
- Seed script creates demo operator auth account + owned operator/sessions docs
- REAL login: signInWithEmailAndPassword + auth-context + middleware route guard
- Portal wired to Firestore (real-time, photo upload, signature, rating)
- Dashboard wired to Firestore (live feed, approve API, schedule, settings, sign out)
- /api/vapi/webhook forwarder + /api/quote/approve + /api/session/[token]
- FCM push notifications on pending_approval

Python ADK multi-agent:
- send_sight_link (real Surge SMS) + analyze_photos (real Gemini Vision)
- GroundingAgent sub-agent (google_search) wired via AgentTool
- EstimatorAgent -> GroundingAgent delegation verified in trace + Cloud Logging
- Deployed to Cloud Run (--min-instances 1)

Verified: full Golden Thread call flow passes on real services."

git push origin main
```

---

## 2:00 PM — Day 2 State of the Build

| Asset | Status |
|---|---|
| Both UIs live on Firestore (no mock data) | ✅ |
| Real login works (judge sign-in path + auth guard) | ✅ |
| Real photo upload → Firebase Storage | ✅ |
| send_sight_link → real Surge SMS | ✅ |
| analyze_photos → real Gemini Vision | ✅ |
| GroundingAgent delegation (multi-agent) verified | ✅ |
| EstimatorAgent + GroundingAgent on Cloud Run | ✅ |
| Vapi webhook → ADK forwarder wired | ✅ |
| FCM push on pending_approval | ✅ |
| Full Golden Thread passes end-to-end | ✅ |
| Working MVP committed + pushed | ✅ |
| **Hours used today** | **~6–7h** |
| **Hours remaining to deadline** | **~51h (to 5 PM PST Thu Jun 11)** |

---

## 2:00 PM Onward — Optional Head-Start on Day 3

If you have energy, pull these Day 3 items forward — each makes tomorrow's
recording safer:

- **Task 22 — Architecture diagram (25 min).** Draw the multi-agent graph from
  SSD v4 Task 22 in Excalidraw/Mermaid. Label the EstimatorAgent → GroundingAgent
  edge "A2A delegation." Export PNG. This is a required deliverable; doing it
  now removes a Day 3 dependency.
- **Task 3.4 — Fallback flows (30 min).** Wrap analyze_photos in try/except with
  a hardcoded fallback AnalysisResult, add a photo-timeout callback, and a
  call-drop guard. These protect the recording from live-service hiccups.
- **Pre-warm rehearsal.** Run the Golden Thread 2 more times to build muscle
  memory for narration and to keep Cloud Run warm.

Do NOT start visual polish (Task 23) tonight if you're tired — it's low-risk and
fits cleanly into Day 3 morning.

---

## End of Day Checklist

```bash
git add .
git commit -m "Day 2 EOD: [note anything completed beyond Task 20]"
git push origin main
```

- [ ] Tasks 11–14 done (frontend fully on Firestore)
- [ ] Real login works: judge signs in from marketing → populated dashboard; guard + sign out verified
- [ ] Task 16 done (real Surge + Gemini tools)
- [ ] Task 16b done (GroundingAgent delegation verified locally)
- [ ] Task 17 done (multi-agent on Cloud Run, min-instances 1)
- [ ] Task 18 done (Vapi webhook forwarder)
- [ ] Task 19 done (FCM push)
- [ ] Task 20 PASSED (full Golden Thread end-to-end)
- [ ] Working MVP committed + pushed
- [ ] (Optional) Architecture diagram drafted

---

## Tomorrow Morning (Wednesday, June 10 — Day 3)

**First 3 actions:**
1. Terminal 1: `cd hiredax && npm run dev`
2. Confirm Cloud Run is still warm: POST a test message to `${DAX_AGENT_URL}/run`
3. Claude Code: paste the Day 3 session starter (see BUILD_PLAN_v6 Day 3)

**Day 3 targets (BUILD_PLAN_v6):**
- Task 21 — Eval set run (include the grounding pass-rate case)
- Task 22 — Architecture diagram (if not done tonight)
- Task 23 — Visual polish (skeletons, transitions, empty states)
- Task 24 — Production deploy to Vercel + update Vapi webhook to prod URL + smoke test
- **VIDEO RECORDING — record the Golden Thread; must be done by Wednesday night**

**Thursday June 11 — SUBMISSION DAY:**
- Finalize README, confirm video uploaded, fill Devpost form, attach diagram
- Submit before **5:00 PM PST / 8:00 PM EST**
- NO new code on Thursday

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Firestore MCP returns null-field error | Re-seed; ensure every optional field has a concrete default (no undefined/null) |
| `analyze_photos` returns non-JSON | Wrap in try/except, parse defensively, fall back to a hardcoded AnalysisResult |
| GroundingAgent never gets called | Confirm get_pricing_context is in root_agent.tools AND SYSTEM_PROMPT step 5b is present |
| Delegation works locally but not on Cloud Run | Re-check the deploy logs; confirm the agents/ package shipped (it's part of the same app) |
| Cloud Run first call is slow / times out | Deploy with `--min-instances 1`; pre-warm with 2 calls before any test |
| SMS never arrives | Verify SURGE_* env vars on Cloud Run (not just local .env); confirm phone in E.164 |
| Vapi webhook 404 | Confirm the webhook URL points at /api/vapi/webhook on the running host/tunnel |
| Portal not updating live | Confirm onSnapshot listener (not a one-time get); check Firestore rules allow read |
| Dashboard empty | Confirm operatorId on seeded sessions matches the logged-in uid |
| Price spoken before approval (Expert Seal breach) | Confirm SYSTEM_PROMPT rule 1 + firestore_get_document check; this MUST be 100% |
| FCM push not firing | Confirm permission granted + token saved to operator doc; otherwise the audio-chime fallback should fire |
| `gcloud` deploy auth error | `gcloud auth login` and `gcloud config set project YOUR_PROJECT_ID` |

---

*HireDax Day 2 Playbook — Tuesday June 9, 2026*
*Hard deadline: Thursday June 11 at 5:00 PM PST (8:00 PM EST)*
*Wire the tracks. Close the loop. Working MVP by midnight. Let's go.*
