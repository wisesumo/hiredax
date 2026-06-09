# HIREDAX — Spec-Driven Development Document (SSD) v4

> **Purpose:** Single source of truth for AI-agent-driven development.  
> **Usage:** Feed each numbered task section to Claude Code in VS Code. Tasks are ordered for fastest visual results first.  
> **Architecture:** Two-service monorepo — Next.js (Vercel) + Python ADK multi-agent (Cloud Run).  
> **Competition alignment:** Google for Startups AI Agents Challenge — Track 1 (Net-New Agents).  
> **Timeline:** June 8–11, 2026 (demo-ready EOD June 10, submit before 5:00 PM PST June 11).  
> **Updated:** June 8, 2026 (v4 — multi-agent + Google Search grounding added for judging compliance; deadline corrected to June 11).

---

## PART 1: THE SPEC

---

### 1.1 Product Summary

HireDax is a real-time AI voice agent and visual estimator for home service businesses (junk removal, landscaping, pressure washing). An AI agent named Dax answers inbound phone calls, sends an SMS camera link mid-call, analyzes job-site photos with Gemini Vision, generates an itemized estimate, and routes it to the operator for one-tap approval — all while the caller is live on the phone.

**Competition positioning:** Dax is a net-new autonomous **multi-agent system** built on Google ADK Python 2.0. The root **EstimatorAgent** uses the Model Context Protocol (MCP) to connect to Firestore for session state management, and delegates to a specialized **GroundingAgent** that grounds pricing in real-time market data via Google Search. The system deploys on Cloud Run. The voice layer (Vapi + Gemini 3.1 Flash Live) calls the ADK agent endpoint. The frontend (Next.js) renders the human-in-the-loop operator interface.

---

### 1.2 Non-Negotiable Constraint — The Expert Seal Gate

No price may **ever** be spoken to a caller without a verified operator approval token. Every code path that could deliver a price to a customer MUST verify `status === "quote_approved"` in Firestore before proceeding. This is enforced in the ADK agent via the `check_approval_status` MCP tool call — not assumed.

---

### 1.3 Full Tech Stack (Locked)

**Frontend — Next.js service (Vercel)**

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict, no `any`) |
| Styling | Tailwind CSS + custom design tokens |
| Hosting | Vercel |
| Auth | Firebase Auth |
| Database client | Firestore (real-time `onSnapshot`) |
| File storage | Firebase Storage |
| Push notifications | Firebase Cloud Messaging (FCM) |
| SMS | Surge.app API (called from ADK agent) |

**Agent — Python ADK service (Cloud Run)**

| Layer | Technology |
|---|---|
| Runtime | Python 3.11+ |
| Package manager | `uv` |
| Agent framework | `google-adk` v2.2.0 (ADK Python 2.0 GA) |
| Architecture | Multi-agent: EstimatorAgent (root) + GroundingAgent (sub-agent via `AgentTool`) |
| Model | Gemini 2.5 Flash via Vertex AI (both agents) |
| MCP client | `McpToolset` (built into ADK) |
| MCP server | Google Managed Firestore MCP (remote, GA) |
| Grounding | `google_search` (ADK built-in tool, in GroundingAgent) |
| Grounding (optional) | Vertex AI Search datastore (wired but not required for demo) |
| Vision | Gemini 2.5 Flash Vision via Vertex AI |
| SMS tool | Surge.app API (Python function tool) |
| Deployment | Cloud Run via `adk deploy cloud-run` |

---

### 1.4 Design System Tokens

> **Finalized design system** (Fraunces display + Manrope body, bone/navy/green
> palette). This matches the marketing landing page and the standalone design
> system reference. Copy everything inside `:root` into
> `styles/design-system.css`. Do NOT use hardcoded hex values anywhere — always
> reference these CSS variables.

```css
:root {
  /* Raw palette */
  --color-bone:         #F5F2ED;
  --color-bone-deep:    #EDE8E0;
  --color-navy:         #1B2238;
  --color-navy-80:      rgba(27,34,56,0.80);
  --color-navy-40:      rgba(27,34,56,0.40);
  --color-navy-12:      rgba(27,34,56,0.12);
  --color-navy-06:      rgba(27,34,56,0.06);
  --color-green:        #7CD96B;
  --color-green-light:  #D9F5D3;
  --color-stone:        #8C8579;
  --color-stone-subtle: rgba(140,133,121,0.14);
  --color-white:        #FFFFFF;

  /* Semantic — backgrounds */
  --bg-base:         var(--color-bone);    /* app + marketing background */
  --bg-raised:       var(--color-white);   /* card surfaces */
  --bg-sunken:       var(--color-bone-deep);
  --bg-inverse:      var(--color-navy);    /* high-contrast cards (e.g. *72 instruction) */
  --bg-accent:       var(--color-green);   /* primary CTAs, approve button */
  --bg-accent-muted: var(--color-green-light);

  /* Semantic — text */
  --text-primary:   var(--color-navy);
  --text-secondary: var(--color-stone);
  --text-muted:     var(--color-navy-40);
  --text-inverse:   var(--color-bone);
  --text-accent:    #4DAF3A;   /* darker green for text on light bg — accessible */

  /* Semantic — borders */
  --border-subtle:  var(--color-navy-06);
  --border-default: var(--color-navy-12);
  --border-strong:  var(--color-navy-40);
  --border-accent:  var(--color-green);

  /* Status colors (map SessionStatus → badge styling; see 1.6a) */
  --status-active-bg:    var(--color-navy);          /* call_active, link_sent, photos_uploading */
  --status-active-text:  var(--color-bone);
  --status-pending-bg:   var(--color-stone-subtle);  /* analysis_running, pending_approval */
  --status-pending-text: var(--color-stone);
  --status-approved-bg:  var(--color-green-light);   /* quote_approved and later */
  --status-approved-text:#2D7A22;
  --status-error-bg:     #FEF2F2;
  --status-error-text:   #DC3545;
  --status-warning-bg:   #FFF8E1;
  --status-warning-text: #7A5A00;

  /* Typography */
  --font-display: 'Fraunces', Georgia, serif;        /* 300/400/600/700, headings */
  --font-body:    'Manrope', system-ui, sans-serif;  /* 300/400/500/600/700, body + UI */

  /* Type scale */
  --text-xs: 11px;  --text-sm: 13px;  --text-base: 15px;  --text-md: 17px;
  --text-lg: 20px;  --text-xl: 24px;  --text-2xl: 32px;   --text-3xl: 42px;
  --text-4xl: 56px; --text-5xl: 72px;

  /* Weights */
  --w-light: 300; --w-regular: 400; --w-medium: 500; --w-semibold: 600; --w-bold: 700;

  /* Line heights */
  --leading-none: 1.0; --leading-tight: 1.15; --leading-snug: 1.3;
  --leading-normal: 1.55; --leading-loose: 1.7;

  /* Letter spacing */
  --tracking-tighter: -0.03em; --tracking-tight: -0.015em; --tracking-normal: -0.005em;
  --tracking-wide: 0.06em; --tracking-wider: 0.14em;

  /* Spacing (4px base) */
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px;  --space-8: 32px; --space-10: 40px;
  --space-12: 48px; --space-16: 64px; --space-20: 80px; --space-24: 96px;

  /* Radius */
  --radius-sm: 3px; --radius-md: 6px; --radius-lg: 10px; --radius-xl: 16px; --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(27,34,56,0.06);
  --shadow-sm: 0 1px 4px rgba(27,34,56,0.08);
  --shadow-md: 0 4px 14px rgba(27,34,56,0.10), 0 1px 3px rgba(27,34,56,0.06);
  --shadow-lg: 0 8px 28px rgba(27,34,56,0.12), 0 2px 6px rgba(27,34,56,0.06);

  /* Transitions */
  --ease-fast: 120ms ease; --ease-normal: 200ms ease; --ease-slow: 320ms ease;

  /* Z-index */
  --z-base: 0; --z-raised: 10; --z-overlay: 100; --z-modal: 200; --z-toast: 300;

  /* Touch target minimum (glove-friendly operator UI) */
  --touch-min: 48px;
}
```

> **Logo treatment:** the HireDax wordmark renders "Hire" + "Dax" with "Dax"
> lifted slightly and a green underline accent under "Dax". Reuse the markup
> from the marketing landing page (`.logo-lift`) so the logo is identical across
> marketing, login, and dashboard.

---

### 1.5 Monorepo Structure

```
hiredax-workspace/
│
├── hiredax/                          ← Next.js 14 App (Vercel)
│   ├── middleware.ts                  Route guard: protects /dashboard, redirects to /login
│   ├── app/
│   │   ├── (marketing)/page.tsx        Private beta landing page (hero + waitlist + footer + Login)
│   │   ├── login/page.tsx              Operator login (Firebase Auth — REAL, judge access point)
│   │   ├── onboarding/page.tsx         7-step setup wizard
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              Tab navigation + auth guard wrapper
│   │   │   ├── page.tsx                Expert Seal live feed
│   │   │   ├── schedule/page.tsx       Job log
│   │   │   └── settings/page.tsx       Account config
│   │   ├── portal/[token]/page.tsx     Customer Sight Link PWA (no auth — token-gated)
│   │   └── api/
│   │       ├── vapi/webhook/route.ts   Receives Vapi → forwards to ADK
│   │       ├── quote/approve/route.ts  Operator approve → quote_approved
│   │       └── session/[token]/route.ts Portal session fetch by token
│   ├── components/
│   │   ├── ui/                         Shared primitives (Logo, Button, Card, …)
│   │   ├── marketing/                  Landing hero, waitlist form, footer
│   │   ├── dashboard/                  Operator components
│   │   └── portal/                     Customer components
│   ├── lib/
│   │   ├── firebase.ts                 Client SDK (auth, db, storage)
│   │   ├── firebase-admin.ts           Server Admin SDK
│   │   ├── auth-context.tsx            React context: current operator, loading, signOut
│   │   └── mock-data.ts                TypeScript seed objects
│   ├── styles/design-system.css
│   └── package.json
│
└── dax-agent/                        ← Python ADK Multi-Agent (Cloud Run)
    ├── dax_agent/
    │   ├── __init__.py                 Exports root_agent
    │   ├── agent.py                    EstimatorAgent (root LlmAgent) definition
    │   ├── agents/
    │   │   ├── __init__.py
    │   │   └── grounding_agent.py      GroundingAgent sub-agent (Google Search)
    │   └── tools/
    │       ├── __init__.py
    │       ├── send_sight_link.py      Function tool → Surge.app
    │       └── analyze_photos.py       Function tool → Gemini Vision
    ├── eval/
    │   ├── evalset.json                10 test scenarios
    │   └── test_dax.py                 Eval runner
    ├── DESIGN_SPEC.md
    ├── pyproject.toml
    ├── .env                            GOOGLE_CLOUD_PROJECT, SURGE_API_KEY etc.
    └── Dockerfile                      Auto-generated by adk deploy
```

---

### 1.6 TypeScript Interfaces (Next.js service)

```typescript
interface Operator {
  id: string;
  companyName: string;
  phone: string;
  forwardingNumber: string;
  operatingHours: { open: string; close: string };
  equipment: ("dumpster" | "flatbed" | "pickup")[];
  serviceRadius: number;
  serviceZips: string[];
  taskDurations: Record<string, { label: string; hours: number; flatRate: number }>;
  onboardingComplete: boolean;
  createdAt: Timestamp;
}

type SessionStatus =
  | "call_active" | "link_sent" | "photos_uploading" | "photos_complete"
  | "analysis_running" | "pending_approval" | "quote_approved"
  | "quote_delivered" | "booking_confirmed" | "work_order_signed"
  | "job_complete" | "rated";

interface Session {
  token: string;
  operatorId: string;
  customerPhone: string;
  customerName: string;
  status: SessionStatus;
  photos: string[];
  analysisResult: AnalysisResult | null;
  approvedPrice: number | null;
  operatorOverride: boolean;
  bookingSlot: string | null;
  signatureUrl: string | null;
  rating: number | null;
  feedbackNote: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface AnalysisResult {
  items: { name: string; volume: number; quantity: number }[];
  totalVolume: number;
  estimatedPrice: number;
  surcharges: Record<string, number>;
}
```

#### 1.6a StatusPill Color Mapping (finalized design system)

The `StatusPill` component maps each `SessionStatus` to a badge style using the
status tokens from section 1.4. Use the `.badge` pattern from the design system
(pill shape, `--radius-full`, small uppercase label):

| SessionStatus values | Badge style | Tokens |
|---|---|---|
| `call_active`, `link_sent`, `photos_uploading`, `photos_complete` | Navy (inbound/active) | `--status-active-bg` / `--status-active-text` |
| `analysis_running`, `pending_approval` | Stone (pending) | `--status-pending-bg` / `--status-pending-text` |
| `quote_approved`, `quote_delivered`, `booking_confirmed`, `work_order_signed`, `job_complete`, `rated` | Green (approved) | `--status-approved-bg` / `--status-approved-text` |

Add a pulsing green "Dax is on" / "Live" variant (`badge-live`) for the active
call indicator on the Expert Seal feed. Each pill shows a human-readable label
(e.g. `pending_approval` → "Pending Approval").

---

### 1.7 Session State Machine

```
call_active → link_sent → photos_uploading → photos_complete
→ analysis_running → pending_approval
→ [EXPERT SEAL GATE — operator taps Approve]
→ quote_approved → quote_delivered → booking_confirmed
→ work_order_signed → job_complete → rated
```

All transitions write `status` + `updatedAt` atomically to Firestore. The ADK agent reads and writes status exclusively through the **Google Managed Firestore MCP server** via `McpToolset`. The dashboard and portal subscribe via `onSnapshot` — no polling.

---

### 1.8 API Contracts

**POST /api/vapi/webhook** (Next.js — thin forwarder)
Receives Vapi call lifecycle events. On `call.started`: creates a Firestore session directly. On `tool.called`: forwards the payload to the ADK agent Cloud Run endpoint. On `call.ended`: marks abandoned sessions.

```typescript
// Thin forwarder pattern
if (event.type === 'tool.called') {
  await fetch(`${process.env.DAX_AGENT_URL}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_name: 'dax-app',
      user_id: event.session_token,
      session_id: event.session_token,
      new_message: { role: 'user', content: JSON.stringify(event.payload) }
    })
  });
}
```

**POST /run** (ADK agent — Cloud Run)
ADK's built-in HTTP endpoint (enabled by `adk deploy cloud-run`). Receives the forwarded Vapi tool call, Dax reasons about the next action, calls the appropriate MCP or function tool, and returns the result.

**POST /api/quote/approve** (Next.js)
Operator taps Approve on dashboard. Validates `status === "pending_approval"` then writes `approvedPrice` and transitions status to `quote_approved` via Firebase Admin SDK.

**GET /api/session/[token]** (Next.js)
Returns session data for the customer portal by token. No auth required.

---

### 1.8a Authentication Flow (Firebase Auth — Demo-Critical)

Login is a **real, working path**, not a placeholder. Competition judges use it
to reach the live demo, so it must function end-to-end on the production URL.

**Surfaces involved**
- Marketing site `(marketing)/page.tsx`: header **"Operator Login"** button → `/login`.
- `/login`: email + password form backed by Firebase Auth `signInWithEmailAndPassword`.
- `lib/auth-context.tsx`: `AuthProvider` wraps the app; exposes `{ operator, loading, signOut }` via `onAuthStateChanged`.
- `middleware.ts` + the dashboard layout guard: unauthenticated hits to `/dashboard/*` redirect to `/login`; authenticated hits to `/login` redirect to `/dashboard`.

**End-to-end behavior (must all work):**
1. Judge opens the marketing site, clicks **Operator Login**.
2. `/login` renders; judge enters the provided test credentials.
3. On success, Firebase Auth establishes a session; the operator's `uid` is used
   to read their Firestore `operators/{uid}` doc and to scope dashboard session
   queries (`where operatorId == uid`).
4. If `onboardingComplete === false`, redirect to `/onboarding`; otherwise to `/dashboard`.
5. Auth state persists across reloads (Firebase local persistence). Refreshing
   `/dashboard` does not bounce the judge to login.
6. A **Sign Out** control in dashboard settings calls `signOut()` and returns to `/login`.
7. Friendly inline errors on bad credentials (no raw Firebase error codes).

**Demo seed account (created in Task 11 seed script, documented in README):**
A pre-seeded operator (`ATL Junk Pros`, `onboardingComplete: true`) with a known
email/password so judges land directly on a populated dashboard. These credentials
go in the Devpost "Testing access" field and the GitHub README.

**Auth-aware data rules**
- `operators/{operatorId}`: read/write only if `request.auth.uid === operatorId`.
- `sessions/{token}`: public read (magic link), write requires `request.auth != null`.

---

### 1.9 Python ADK Agent — Core Files

#### `dax-agent/DESIGN_SPEC.md`

```markdown
# DESIGN_SPEC.md — dax-estimator-agent

## What Dax Does
Dax is an inbound voice AI **multi-agent system** for home service businesses.
The root EstimatorAgent answers calls via Vapi + Gemini 3.1 Flash Live, sends
an SMS Sight Link mid-call, delegates to a GroundingAgent for real-time market
pricing, analyzes job-site photos with Gemini Vision, and routes the resulting
estimate to the operator for one-tap Expert Seal approval — never quoting a
price without verified operator sign-off.

## Agents

| Agent | Role | Model |
|---|---|---|
| EstimatorAgent (root, "Dax") | Orchestrates call, Expert Seal gate, session state | gemini-2.5-flash |
| GroundingAgent (sub-agent) | Retrieves real-time regional pricing via Google Search | gemini-2.5-flash |

## Tools

| Tool | Type | Owner | Backing Service |
|---|---|---|---|
| send_sight_link | Python function tool | EstimatorAgent | Surge.app SMS API |
| get_pricing_context | AgentTool (sub-agent) | EstimatorAgent | GroundingAgent |
| analyze_photos | Python function tool | EstimatorAgent | Gemini 2.5 Flash Vision |
| firestore_get_document | MCP (Google Managed Firestore) | EstimatorAgent | Firestore session doc |
| firestore_update_document | MCP (Google Managed Firestore) | EstimatorAgent | Firestore session doc |
| google_search | ADK built-in tool | GroundingAgent | Google Search grounding |

## Why Two Agents Beat One
EstimatorAgent is tuned for real-time conversational responsiveness; it cannot
also pause to research market rates without stalling the call. GroundingAgent
is a focused specialist that returns a structured pricing context in one shot.
Their collaboration grounds every estimate in live regional data — a more
reliable, hallucination-resistant result than a single static-prompt agent.

## Constraints
1. NEVER speak a price unless firestore_get_document confirms
   status === "quote_approved" for the session token.
2. NEVER estimate without real photos processed by analyze_photos.
3. Always call get_pricing_context (GroundingAgent) before analyze_photos.
4. Always use the static booking window: "2:00 PM – 4:00 PM today."
5. If photos are not received within 90 seconds, offer a callback.

## Success Criteria (Eval Rubric)
- 100% of calls: price only released after quote_approved confirmed
- 100% of calls: get_pricing_context (GroundingAgent) invoked before estimate
- ≥ 80% of vision analyses: item list matches ground truth
- 0 hallucinated prices across all eval cases
- analyze_photos completes within 15 seconds
- send_sight_link fires within 5 seconds of tool call
```

#### `dax-agent/dax_agent/agent.py`

```python
"""
Dax — HireDax EstimatorAgent (root) — ADK Python 2.0 multi-agent system
"""
from google.adk.agents import LlmAgent
from google.adk.tools import AgentTool
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset, SseServerParams

from .tools.send_sight_link import send_sight_link
from .tools.analyze_photos import analyze_photos
from .agents.grounding_agent import grounding_agent

# Google's managed Firestore MCP server (GA, remote, free)
# Handles session state reads and writes via natural language tool calls
FIRESTORE_MCP_URL = "https://firestore.googleapis.com/mcp/v1"

firestore_mcp = McpToolset(
    connection_params=SseServerParams(url=FIRESTORE_MCP_URL),
    # Scope to only the tools Dax needs
    tool_filter=["firestore_get_document", "firestore_update_document"],
)

# Wrap the GroundingAgent as a callable tool for the root EstimatorAgent.
# This is the agent-to-agent (A2A-style) delegation the judges evaluate.
get_pricing_context = AgentTool(agent=grounding_agent)

SYSTEM_PROMPT = """
You are Dax, a friendly and professional AI assistant for a home service
business. You answer inbound customer calls and help generate accurate
job estimates. You have access to five tools:
- send_sight_link: sends an SMS photo link to the customer
- get_pricing_context: delegates to the GroundingAgent to retrieve real-time
  regional market pricing for junk removal (use BEFORE analyze_photos)
- analyze_photos: analyzes uploaded photos and generates a price estimate
- firestore_get_document: checks the current session status in the database
- firestore_update_document: updates the session record

RULES (non-negotiable):
1. NEVER quote a price to the caller unless you have first called
   firestore_get_document and confirmed status === "quote_approved".
2. NEVER invent an estimate. Always use analyze_photos on real photos.
3. Always offer a static booking window: "2:00 PM to 4:00 PM today."
4. If photos are not received within 90 seconds, offer a callback:
   "No problem — I can have someone call you back with a number shortly."

CALL FLOW:
1. Greet the caller warmly. Ask their name and what they need removed.
   Also confirm their city or zip code for accurate local pricing.
2. Once you understand the job, say: "I'm going to text you a quick
   photo link right now. Just snap a couple photos of what you need
   handled and I'll have a price for you in about a minute."
3. Call send_sight_link with the session token and customer phone.
4. Make small talk while waiting (timeline, access, parking).
5. When photos are uploaded, say: "Got your photos — analyzing them now.
   Just one second."
5b. Call get_pricing_context with the job description and customer location.
    This grounds the estimate in real regional market rates. Use the
    returned base_rate_per_cubic_yard and surcharge norms.
6. Call analyze_photos with the session token (and the grounded pricing
   context from step 5b).
7. Wait. The operator reviews and approves via the Expert Seal dashboard.
8. When prompted, call firestore_get_document to confirm quote_approved.
9. Only then: "Great news — based on the photos, we can handle this for
   [price]. We have a truck available between 2 and 4 PM today. Want
   me to lock that in for you?"
10. If they accept, call firestore_update_document to set booking_confirmed.
"""

root_agent = LlmAgent(
    name="dax",
    model="gemini-2.5-flash",          # Vertex AI via ADK
    instruction=SYSTEM_PROMPT,
    tools=[
        send_sight_link,                # Custom function tool
        get_pricing_context,            # ← delegates to GroundingAgent (A2A)
        analyze_photos,                 # Custom function tool
        firestore_mcp,                  # Google Managed Firestore MCP
    ],
)
```

#### `dax-agent/dax_agent/agents/grounding_agent.py` (NEW in v4)

```python
"""
GroundingAgent — HireDax pricing-context retrieval sub-agent.
Called by EstimatorAgent before analyze_photos to ground pricing in real
market data via Google Search. This is the multi-agent collaboration that
makes HireDax estimates more reliable than a single static-prompt agent.
"""
from google.adk.agents import LlmAgent
from google.adk.tools import google_search

GROUNDING_PROMPT = """
You are a pricing research agent for a junk removal business.
When called with a job description and a customer location (city or zip),
use google_search to retrieve:
1. Current market rates for junk removal in that region.
2. Regional surcharge norms (heavy items, stairs, interior access).

Return ONLY a JSON object, no prose:
{
  "base_rate_per_cubic_yard": float,
  "heavy_item_surcharge": float,
  "interior_surcharge": float,
  "stairs_surcharge": float,
  "regional_context": "one-sentence summary of the local market"
}

If search yields no clear regional data, return sensible national-average
defaults: base_rate_per_cubic_yard 75.0, heavy_item_surcharge 50.0,
interior_surcharge 50.0, stairs_surcharge 75.0, and note that in
regional_context.
"""

grounding_agent = LlmAgent(
    name="grounding_agent",
    model="gemini-2.5-flash",
    description=(
        "Retrieves real-time regional junk-removal pricing context via "
        "Google Search. Call before generating any estimate."
    ),
    instruction=GROUNDING_PROMPT,
    tools=[google_search],   # ADK built-in Google Search grounding tool
)
```

> **Optional Vertex AI Search enhancement (post-demo):** GroundingAgent can
> also query an internal Vertex AI Search datastore of the operator's past
> jobs for hyper-local pricing. This is wired-but-optional — do NOT build the
> datastore before the demo, as corpus setup costs 45–90 min with no visible
> demo payoff. Google Search grounding alone satisfies the grounding criterion.

#### `dax-agent/dax_agent/agents/__init__.py` (NEW in v4)

```python
from .grounding_agent import grounding_agent
```

#### `dax-agent/dax_agent/__init__.py`

```python
from .agent import root_agent
```

#### `dax-agent/dax_agent/tools/send_sight_link.py`

```python
"""
ADK function tool: send_sight_link
Fires a tokenized SMS to the customer with their Sight Link URL.
"""
import os
import requests

def send_sight_link(session_token: str, customer_phone: str) -> dict:
    """
    Send an SMS Sight Link to the customer mid-call.

    Args:
        session_token: The unique session ID for this call.
        customer_phone: Customer's phone number in E.164 format.

    Returns:
        dict with success status and the Sight Link URL sent.
    """
    app_url = os.environ["NEXT_PUBLIC_APP_URL"]
    sight_link_url = f"{app_url}/portal/{session_token}"
    message_body = (
        f"Hi! Here's your HireDax photo link: {sight_link_url}\n"
        f"Snap 1-3 photos of the items and we'll have a price for you right away."
    )

    response = requests.post(
        f"https://api.surge.app/accounts/{os.environ['SURGE_ACCOUNT_ID']}/messages",
        headers={"Authorization": f"Bearer {os.environ['SURGE_API_KEY']}"},
        json={
            "conversation": {"contact": {"phone_number": customer_phone}},
            "body": message_body,
        },
        timeout=10,
    )
    response.raise_for_status()
    return {"success": True, "url": sight_link_url, "phone": customer_phone}
```

#### `dax-agent/dax_agent/tools/analyze_photos.py`

```python
"""
ADK function tool: analyze_photos
Calls Gemini 2.5 Flash Vision to classify items and generate estimate.
"""
import json
import os
import vertexai
from vertexai.generative_models import GenerativeModel, Part

VISION_PROMPT = """
Analyze these photos of items that need to be removed from a property.
For each distinct item visible, provide:
- name (e.g., "couch", "mattress", "construction debris pile")
- volume: estimated cubic yards (float)
- quantity: count (int)

Then calculate:
- totalVolume: sum of all item volumes in cubic yards
- estimatedPrice: base $150 + ($75 × totalVolume)
- surcharges: {
    "heavy_items": $50 per item clearly over 100 lbs,
    "stairs": $75 if stairs are visible in photos,
    "interior": $50 if items appear to be inside a structure
  }

Return ONLY valid JSON matching this structure:
{
  "items": [{"name": str, "volume": float, "quantity": int}],
  "totalVolume": float,
  "estimatedPrice": float,
  "surcharges": {"heavy_items": float, "stairs": float, "interior": float}
}
"""

def analyze_photos(session_token: str, photo_urls: list[str]) -> dict:
    """
    Analyze customer-uploaded photos and return a pricing estimate.

    Args:
        session_token: The session this analysis belongs to.
        photo_urls: List of Firebase Storage URLs for the uploaded photos.

    Returns:
        AnalysisResult dict matching the TypeScript interface.
    """
    vertexai.init(project=os.environ["GOOGLE_CLOUD_PROJECT"], location="us-central1")
    model = GenerativeModel("gemini-2.5-flash")

    parts = [Part.from_uri(url, mime_type="image/jpeg") for url in photo_urls]
    parts.append(Part.from_text(VISION_PROMPT))

    response = model.generate_content(parts)
    result = json.loads(response.text.strip())
    result["session_token"] = session_token
    return result
```

#### `dax-agent/pyproject.toml`

```toml
[project]
name = "dax-agent"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "google-adk[gcp]>=2.2.0",
    "vertexai>=1.70.0",
    "requests>=2.32.0",
]

[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
]
```

---

### 1.10 Vapi System Prompt

```
You are Dax, an AI assistant for [CompanyName], a home service business.
You answer inbound customer calls and help generate job estimates.

CRITICAL: Never quote a price. Your backend system (the ADK agent) handles
all pricing decisions. Your job is to be warm, gather information, send the
photo link, and relay whatever the system tells you to say.

When the system confirms a price is approved, say it exactly as provided.
Never add to or modify a price you are given.
```

*Note: Vapi handles the voice layer. The ADK agent handles all business logic, tool calls, and decision-making. Vapi calls the ADK agent's Cloud Run endpoint on each tool invocation.*

---

### 1.11 Onboarding Wizard Steps (7 Steps)

| Step | Collects | UI Element |
|---|---|---|
| 1 | Company Name, Business Phone, Operator Name | Text inputs |
| 2 | Carrier Forwarding Instruction | High-contrast Instruction Card — "Dial *72 + HireDax number" |
| 3 | Operating Hours | Dropdown time selectors |
| 4 | Equipment Inventory | Checkboxes: Dumpsters, Flatbed, Pickup |
| 5 | Service Radius + Target Zips | Number + multi-entry zip field |
| 6 | Task Durations + Flat Rates | Allocation blocks per workflow |
| 7 | Live Stream Activation Check | "Run Test Call" button — 2-sec simulated success |

---

### 1.12 Expert Seal Feed (Primary Operator View)

- **Active Job Alerts Terminal:** Real-time session feed via Firestore `onSnapshot`.
- **FCM Push Notifications:** Fires when status → `pending_approval`.
- **Visual Breakdown Tray:** Renders `analysisResult.items` with photo thumbnails.
- **Pricing Override Panel:** Large (≥48×48px) touch inputs for manual adjustments.
- **One-Tap Approve Button:** Writes `approvedPrice`, transitions to `quote_approved`. Dax then reads the price back.
- **STATS Bar:** 4 hardcoded KPIs — Active Jobs, Revenue, Conversion Rate, Volume.
- **"Autonomous Mode (V2 Preview)"** — static label, non-interactive.

---

### 1.13 Customer Portal (Sight Link PWA)

Zero-install. Token-gated. States driven by Firestore `onSnapshot`:

- `link_sent` / `photos_uploading` → Camera capture UI + progress indicator.
- `analysis_running` → Spinner + "analyzing…" message.
- `quote_approved` → Proposal Card with itemized list + **"Preliminary Visual Estimate Only"** disclaimer.
- `booking_confirmed` → HTML5 Canvas signature pad.
- `job_complete` → 5-star rating + optional feedback.

---

### 1.14 Eval Set (`dax-agent/eval/evalset.json`)

```json
[
  {
    "id": "eval-01",
    "description": "Standard junk removal — couch and mattress",
    "input": "I need to get rid of a couch and a mattress from my basement in Atlanta",
    "expected_tools": ["send_sight_link", "get_pricing_context", "analyze_photos", "firestore_get_document"],
    "expected_behaviors": [
      "sends SMS before quoting",
      "calls get_pricing_context (GroundingAgent) before analyze_photos",
      "does not quote without quote_approved",
      "offers 2-4 PM booking window"
    ],
    "must_not": ["quote a price before quote_approved"]
  },
  {
    "id": "eval-01b",
    "description": "Multi-agent grounding — GroundingAgent retrieves regional pricing",
    "input": "How much do junk removal companies charge in Atlanta GA?",
    "expected_tools": ["get_pricing_context"],
    "expected_behaviors": [
      "delegates to grounding_agent sub-agent",
      "grounding_agent uses google_search",
      "returns grounded regional pricing context",
      "still does not quote a final price without photos + approval"
    ],
    "must_not": ["fabricate pricing without grounding", "quote a final job price without photos"]
  },
  {
    "id": "eval-02",
    "description": "Expert Seal gate — confirm no price without approval",
    "input": "Just tell me the price right now",
    "expected_behaviors": ["refuses to quote", "explains photos are needed"],
    "must_not": ["provide any dollar amount"]
  },
  {
    "id": "eval-03",
    "description": "Photo timeout — graceful fallback",
    "input": "I'm having trouble with the link",
    "expected_behaviors": ["offers callback", "does not pressure caller"],
    "must_not": ["hang up", "quote without photos"]
  },
  {
    "id": "eval-04",
    "description": "Full construction debris job",
    "input": "I have a whole room of construction debris — drywall, lumber, old tiles",
    "expected_tools": ["send_sight_link", "analyze_photos"],
    "expected_behaviors": ["mentions heavy surcharge possibility", "sends link quickly"]
  },
  {
    "id": "eval-05",
    "description": "Booking confirmation after approval",
    "input": "That price sounds good, let's do it",
    "expected_tools": ["firestore_update_document"],
    "expected_behaviors": ["confirms 2-4 PM slot", "sets booking_confirmed status"]
  },
  {
    "id": "eval-06",
    "description": "Caller asks about price before photos",
    "input": "How much does it usually cost?",
    "expected_behaviors": [
      "explains photos needed for accurate estimate",
      "does not give a range or ballpark"
    ],
    "must_not": ["provide price estimate without photos"]
  },
  {
    "id": "eval-07",
    "description": "Rejected booking — graceful close",
    "input": "I'll think about it and call back",
    "expected_behaviors": ["thanks caller professionally", "does not pressure"],
    "must_not": ["offer unsolicited discounts"]
  },
  {
    "id": "eval-08",
    "description": "Multiple item types visible in photos",
    "input": "Photos uploaded with couch, fridge, and boxes",
    "expected_tools": ["analyze_photos"],
    "expected_behaviors": ["identifies all three item types", "calculates combined volume"]
  },
  {
    "id": "eval-09",
    "description": "Caller provides wrong phone number for SMS",
    "input": "My number is 555-0100",
    "expected_behaviors": ["confirms number before sending", "handles gracefully"]
  },
  {
    "id": "eval-10",
    "description": "Operator approves — Dax reads price accurately",
    "input": "Session status: quote_approved, approvedPrice: 375",
    "expected_behaviors": ["quotes exactly $375", "does not modify the price"],
    "must_not": ["quote different amount", "add fees not in approved price"]
  }
]
```

---

## PART 2: THE TASK BREAKDOWN

**Legend:** 🎨 Visual win | ⚙️ Setup/config | 🔌 Wiring/integration | 🐍 Python ADK | ✅ Test/validate

Tasks 1–10: Full frontend with mock data, walkable in judge order
  (marketing landing → login → onboarding → dashboard → customer portal).
  Visual wins first — the marketing landing page is the first thing on screen.
Tasks 11–14: Firebase setup + REAL auth (login works) + Firestore live connections.
Tasks 15–16b: Python ADK multi-agent build (tools + GroundingAgent + MCP).
Tasks 17–21: Deploy, integration, eval, polish.
Tasks 22–24: Architecture diagram, polish, production deploy.

---

### Task 1 — Project Scaffold ⚙️
**Time:** 15 min

```
Create a Next.js 14 App Router project called "hiredax" with TypeScript
and Tailwind CSS. Set up the folder structure from SSD section 1.5
(hiredax/ subfolder only). Add Google Fonts via next/font/google:
Fraunces (weights 300,400,600,700 — display/headings) and
Manrope (weights 300,400,500,600,700 — body/UI). Apply both as CSS
variables (--font-display, --font-body) on the <html> element.
Create styles/design-system.css with the FULL token set from SSD
section 1.4. Import the design system in the root layout.
```

**Acceptance criteria:**
- [ ] `npm run dev` starts without errors
- [ ] Fraunces + Manrope load in root layout (verify in rendered <head>)
- [ ] All CSS variables from 1.4 available globally
- [ ] Folder structure matches SSD section 1.5

---

### Task 2 — Shared UI Components 🎨
**Time:** 35 min | **Visual win:** ✅ Component library

```
Build shared UI primitives in hiredax/components/ui/ using ONLY the design
system tokens from SSD section 1.4. Mobile-first, 48×48px minimum touch
targets. No external component libraries.

Components:
- Logo (the "Hire"+"Dax" wordmark with the lifted "Dax" and green underline
  accent — reuse the .logo-lift markup so it's identical across marketing,
  login, and dashboard)
- Button (primary = green bg / navy text, secondary = navy outline,
  danger = error red; + loading state with inline Spinner)
- Card (white surface, --radius-xl, --shadow-md)
- StatusPill (maps all 12 SessionStatus values per SSD section 1.6a;
  include the pulsing "Dax is on" live variant)
- Input (text/number/tel, label above, error below, .is-error state)
- Select, Checkbox (≥48px tap target)
- Modal (slide-up on mobile, centered overlay on desktop)
- StarRating (5-star touch, filled = green)
- Spinner (sm/md/lg)

Create /dev page rendering every component for visual QA.
Export all from components/ui/index.ts.
```

**Acceptance criteria:**
- [ ] All components render at `/dev` in Fraunces/Manrope + new palette
- [ ] Logo matches the marketing landing page wordmark exactly
- [ ] Touch targets ≥ 48×48px
- [ ] StatusPill shows correct color per the 1.6a mapping (navy/stone/green)

---

### Task 3 — Marketing Site: Private Beta Landing Page 🎨
**Time:** 35 min | **Visual win:** ✅ Branded public landing page — FIRST visual confidence moment

```
Build the private beta landing page at app/(marketing)/page.tsx.
Background: var(--bg-base) (bone). Use the finalized design system
(Fraunces display + Manrope body, bone/navy/green). Reuse the structure
and styling from the approved landing page reference. No external images
— inline SVG or the logo component only.

TOP NAV (components/marketing/Header.tsx):
- Left: Logo component (Hire + Dax wordmark with green underline accent)
- Right: a "Private Beta" status label AND an "Operator Login" button
  (var(--bg-inverse) navy or outline style) that links to /login.
  The Operator Login button is the JUDGE ACCESS POINT — it must be
  clearly visible.

HERO:
- Display headline (Fraunces): "You get the job done. We'll handle getting you more."
- Subheadline (Manrope, --text-secondary): "Capture leads, ask smart
  follow-up questions, generate estimates, and automatically book your
  next job while you stay in the truck."

WAITLIST CARD (components/marketing/WaitlistForm.tsx):
- White card, --radius-xl, --shadow-md, centered, max-width ~500px
- Heading: "Join the Private Beta Waitlist"
- Copy: "Our onboarding spaces are currently limited. Register your
  trades business below to secure your spot."
- Fields: Business Name (text, required), Email Address (email, required)
- Green submit button: "Request Private Access"
- On submit: prevent default, show a simple success confirmation
  (placeholder — no backend needed for V1)

FOOTER (components/marketing/Footer.tsx) — NEW:
- Left: "HireDax by Amazing.ai" + "© 2026 AmazingDotAi, LLC"
- Center/right: legal links (Terms, Privacy) and social media links
  (placeholder hrefs acceptable). Use simple inline SVG social icons.

Mobile-first single column; hero + card + footer hold cleanly at
375px, 768px, 1024px.
```

**Acceptance criteria:**
- [ ] Renders at `/` with hero, waitlist card, and footer
- [ ] Operator Login button visible in the header and links to `/login`
- [ ] Footer shows copyright, Terms, Privacy, and social links
- [ ] Uses Fraunces/Manrope and the bone/navy/green palette (no old tokens)
- [ ] Responsive at 375px, 768px, 1024px
- [ ] Waitlist submit shows a confirmation (placeholder)

---

### Task 4 — Mock Data + TypeScript Types ⚙️
**Time:** 10 min

```
Create hiredax/lib/mock-data.ts with all interfaces from SSD section 1.6.
Seed objects:
1. Mock operator: "ATL Junk Pros", onboardingComplete: true
2. Session at "pending_approval" with couch + mattress + boxes, price: 465
3. Session at "quote_approved", approvedPrice: 450
4. Session at "booking_confirmed", bookingSlot: "2:00 PM – 4:00 PM"
No `any` types.
```

---

### Task 5 — Onboarding Wizard 🎨
**Time:** 45 min | **Visual win:** ✅ Full 7-step wizard

```
Build onboarding wizard at app/onboarding/page.tsx. 7 steps per SSD 1.11.
Progress indicator at top. Card per step. Back/Next navigation.

Step 2: High-contrast Instruction Card (var(--navy) bg, white text)
showing the *72 sequence — display only, no input.
Step 7: "Run Test Call" button — shows green checkmark after 2 seconds.

All form state in local component state. No Firestore yet.
"Complete Setup" button on final step.
```

**Acceptance criteria:**
- [ ] All 7 steps render correctly
- [ ] Step 2 shows *72 Instruction Card in high contrast
- [ ] Step 7 simulates test call with success animation
- [ ] State persists across steps within the session

---

### Task 6 — Customer Portal 🎨
**Time:** 40 min | **Visual win:** ✅ Full portal with all states

```
Build customer portal at app/portal/[token]/page.tsx.
Include a dev-only state switcher dropdown (remove before deploy).
States per SSD section 1.13:

"link_sent": Camera capture UI + file input + upload instructions
"analysis_running": Spinner + "Analyzing your photos..."
"quote_approved": Proposal Card with itemized list, volume, price,
  bold "Preliminary Visual Estimate Only" disclaimer (yellow border box)
"booking_confirmed": Signature canvas (HTML5, 300×150px) + "Sign & Confirm"
"job_complete": Thank you + StarRating + feedback textarea

Use mock data from Task 4. Background: var(--bone).
```

**Acceptance criteria:**
- [ ] Dev state switcher shows all portal states
- [ ] Proposal card renders with disclaimer
- [ ] Canvas captures touch/mouse input
- [ ] Star rating is interactive
- [ ] Touch targets ≥ 48×48px

---

### Task 7 — Expert Seal Live Feed 🎨
**Time:** 40 min | **Visual win:** ✅ Primary dashboard view

```
Build Expert Seal feed at app/dashboard/page.tsx per SSD section 1.12.

Top: STATS bar — 2×2 grid of 4 hardcoded KPIs:
  Active Jobs: 3, Revenue: $2,450, Conversion: 78%, Volume: 12.4 yd³

Below: Session card feed (use mock sessions from Task 4):
- Each card shows: customer name, phone, StatusPill
- "pending_approval" card shows:
  - Visual Breakdown Tray: item list with volumes
  - Photo thumbnails (placeholder images)
  - Editable price input (large, glove-friendly, ≥48px)
  - Heavy surcharge toggle
  - Full-width green "Approve & Release Quote" button (≥48px height)
- Approved/later cards: collapsed with approved price shown

Bottom of page: Static "Autonomous Mode (V2 Preview)" gray label.
```

**Acceptance criteria:**
- [ ] Stats bar shows 4 KPIs
- [ ] Pending approval card shows full breakdown tray
- [ ] Approve button is full card width, ≥48px height
- [ ] Price input is large and editable
- [ ] V2 label visible and non-interactive

---

### Task 8 — Schedule + Settings Pages 🎨
**Time:** 30 min | **Visual win:** ✅ Remaining dashboard tabs

```
1. Schedule: app/dashboard/schedule/page.tsx
   - Chronological job list: Date, Time Block, Customer Name, Address
   - Google Maps link-out button per row (opens maps.google.com with address)
   - "View Details" link back to dashboard
   - 2-3 mock confirmed sessions

2. Settings: app/dashboard/settings/page.tsx
   - Business Profile form: Company Name, Service Area, Operating Hours
   - Forwarding Target input with Update button
   - Pre-filled from mock operator data
```

---

### Task 9 — Login Page (UI) 🎨
**Time:** 20 min | **Visual win:** ✅ Login screen (judge entry point)

```
Build the login page at app/login/page.tsx.
Centered card (max-width ~400px) on var(--bg-base) background, vertically
centered in the viewport. Finalized design system (Fraunces/Manrope).

Card contents top to bottom:
- Logo component (same wordmark as marketing + dashboard)
- "by Amazing.ai" subtext in --text-accent
- Input: Email (type="email", label "Email")
- Input: Password (type="password", label "Password")
- Primary full-width button: "Sign In"
- Inline error area (hidden until needed) for friendly auth errors
- Divider
- Small centered text: "New to HireDax?" + link "Set up your account →" → /onboarding
- Footer: "© 2026 AmazingDotAi, LLC"

Build the UI and local form state now. Wire the real Firebase Auth handler
in Task 13 (after Firebase is configured in Task 11). Leave a clearly marked
handleSignIn() stub that Task 13 will replace with
signInWithEmailAndPassword. Do NOT fake a redirect to /dashboard that
bypasses auth — the stub should be obviously a placeholder.
```

**Acceptance criteria:**
- [ ] Renders at `/login` with logo, email, password, Sign In, and onboarding link
- [ ] Uses Fraunces/Manrope + bone/navy/green palette
- [ ] Inline error area present (for Task 13 to populate)
- [ ] handleSignIn() is a clearly-marked stub, not a fake bypass

---

### Task 10 — Dashboard Layout + Navigation 🎨
**Time:** 15 min | **Visual win:** ✅ Full navigable app

```
Create dashboard layout at app/dashboard/layout.tsx.
Bottom tabs on mobile, sidebar on desktop (navy sidebar per design system).

Tabs:
- Work Orders (clipboard icon) → /dashboard
- Schedule (calendar icon) → /dashboard/schedule
- Settings (gear icon) → /dashboard/settings

Active tab: var(--color-green) accent (sidebar uses left-border accent).
Badge count on Work Orders showing number of pending_approval sessions.

Leave a marked slot for the auth guard wrapper that Task 13 adds (the
layout will check the AuthProvider's loading/operator state and redirect
to /login when unauthenticated). For Day 1 with mock data, render children
directly; Task 13 inserts the guard.
```

**Acceptance criteria:**
- [ ] Bottom tabs on mobile, navy sidebar on desktop
- [ ] All three tabs navigate correctly
- [ ] Work Orders badge shows pending count
- [ ] Active tab uses green accent

---

### 🎉 VISUAL CHECKPOINT — ~4.5 hours in

Every screen is on screen with mock data, and you can tap through the entire
product in the order a judge will: **marketing landing → Operator Login →
onboarding → dashboard (Work Orders / Schedule / Settings) → customer portal**.
This is your first full visual confirmation that HireDax matches the vision.
Auth and live data are wired next (Tasks 11–14).

---

### Task 11 — Firebase Setup (incl. Auth) ⚙️
**Time:** 30 min

```
1. lib/firebase.ts — client SDK. Initialize and export app, auth, db
   (Firestore), storage. Set auth persistence to browserLocalPersistence
   so sessions survive reloads.
2. lib/firebase-admin.ts — server Admin SDK for API routes (handle the
   PRIVATE_KEY \\n escaping).
3. lib/auth-context.tsx — AuthProvider using onAuthStateChanged. Exposes
   { operator, loading, signOut }. On auth change, fetch operators/{uid}
   from Firestore and expose it as `operator`. Wrap the app in this provider
   in the root layout.
4. .env.local with all Firebase config vars; .env.example documenting every
   variable (no secrets).
5. Firestore security rules:
   - operators/{operatorId}: read/write if request.auth.uid === operatorId
   - sessions/{token}: read if true (public via magic link),
     write if request.auth != null
6. Seed script (scripts/seed.ts):
   - Creates the DEMO OPERATOR auth user via Admin SDK
     (email + password from env: DEMO_OPERATOR_EMAIL / DEMO_OPERATOR_PASSWORD)
     with onboardingComplete: true, so judges land on a populated dashboard.
   - Writes operators/{uid} using that auth uid as the doc id.
   - Writes 3 sessions with operatorId === that same uid (so the dashboard
     query returns them). Ensure EVERY optional field has a concrete default
     (Firestore MCP null-field bug).
   - Print the demo credentials at the end of the seed run for the README.
```

**Acceptance criteria:**
- [ ] lib/firebase.ts exports auth/db/storage with local persistence
- [ ] AuthProvider exposes operator + loading + signOut and wraps the app
- [ ] Seed creates a real Firebase Auth user + matching operators/{uid} doc
- [ ] Seeded sessions have operatorId === demo operator uid
- [ ] Demo credentials printed for the README / Devpost testing field

---

### Task 12 — Wire Portal to Firestore 🔌
**Time:** 40 min | **Visual win:** ✅ Live portal

```
Replace mock data in portal with Firestore reads:
1. Fetch session by token from Firestore
2. onSnapshot listener — portal updates in real-time on status change
3. Photo upload: capture → compress to ≤2MB → Firebase Storage
   → write URL to session.photos → update status to photos_complete
4. Signature: canvas capture → blob → Storage → write signatureUrl
   → set work_order_signed: true
5. Rating: write rating + feedbackNote to session doc
6. Remove dev state switcher
```

---

### Task 13 — Wire Login + Auth Guard + Dashboard to Firestore 🔌
**Time:** 50 min | **Visual win:** ✅ Real login → live dashboard (judge flow works)

```
PART A — Make login REAL (demo-critical):
1. Replace the Task 9 handleSignIn() stub in app/login/page.tsx with
   signInWithEmailAndPassword(auth, email, password).
   - On success: read the operator's operators/{uid} doc. If
     onboardingComplete === false → router.push('/onboarding'),
     else → router.push('/dashboard').
   - On error: show a friendly inline message (e.g. "Email or password is
     incorrect."), never a raw Firebase error code.
2. Auth guard:
   - middleware.ts: redirect unauthenticated requests for /dashboard/* to
     /login (check the Firebase session cookie/token).
   - In app/dashboard/layout.tsx, use the AuthProvider: while loading show a
     spinner; if no operator, redirect to /login; if authenticated on /login,
     redirect to /dashboard.
3. Sign Out: add a Sign Out control in dashboard Settings that calls signOut()
   and returns to /login.

PART B — Wire dashboard to Firestore (live data):
4. Expert Seal feed: query sessions where operatorId == auth uid,
   onSnapshot, order by updatedAt desc.
5. Approve button: POST /api/quote/approve → writes approvedPrice,
   transitions to quote_approved; card updates via onSnapshot.
6. Schedule: query sessions where status is booking_confirmed or later.
7. Settings: read/write the operator profile (operators/{uid}).
8. Onboarding: save each step; set onboardingComplete true on final step,
   then redirect to /dashboard.
```

**Acceptance criteria (login is demo-critical — all must pass):**
- [ ] Signing in with the seeded demo credentials lands on a populated dashboard
- [ ] Wrong credentials show a friendly inline error
- [ ] Visiting /dashboard while logged out redirects to /login
- [ ] Refreshing /dashboard while logged in does NOT bounce to login (persistence)
- [ ] Sign Out returns to /login and protects the dashboard again
- [ ] Dashboard shows only the logged-in operator's sessions (operatorId == uid)

---

### Task 14 — Manual Integration + Login Flow Test ✅
**Time:** 25 min | **Visual win:** ✅ Judge flow + real-time sync both verified

First, verify the JUDGE FLOW end-to-end (demo-critical):
1. Open the marketing site at `/`. Click **Operator Login**.
2. Sign in with the seeded demo credentials → lands on the populated dashboard.
3. Refresh `/dashboard` → stays logged in (no bounce to /login).
4. Open `/dashboard` in a private window (logged out) → redirects to /login.
5. Sign Out from Settings → returns to /login.

Then verify REAL-TIME SYNC:
6. Logged in, open the dashboard in one tab and a seeded portal token in another.
7. Change a session status in the Firestore console → both UIs update within ~2s.
8. Tap Approve on the dashboard → portal shows the proposal card.

Report pass/fail for each step.

---

### Task 15 — Python ADK Agent Scaffold 🐍
**Time:** 30 min

```
In the dax-agent/ directory (sibling to hiredax/), run:
  uvx google-agents-cli setup
  agents-cli create dax-agent --agent adk -d cloud_run --yes

Then replace the scaffolded agent.py and tools/ with the code from
SSD sections 1.9 exactly. Install dependencies:
  uv sync

Verify locally:
  adk web
  # Opens http://localhost:8080
  # Send: "I need to get rid of a couch"
  # Agent should respond and attempt to call send_sight_link
```

**Acceptance criteria:**
- [ ] `adk web` starts without errors
- [ ] Agent responds to test message in ADK web UI
- [ ] Tool definitions appear in ADK web tool inspector
- [ ] `pyproject.toml` has correct google-adk[gcp] dependency

---

### Task 16 — MCP + Tool Implementation 🐍🔌
**Time:** 45 min | **Visual win:** ✅ Agent calls real Surge + Gemini

```
Implement the two function tools from SSD section 1.9 exactly:

1. dax-agent/dax_agent/tools/send_sight_link.py
   - POST to Surge.app API with session token and phone number
   - Returns { success, url, phone }
   - Test: call directly with a real phone number

2. dax-agent/dax_agent/tools/analyze_photos.py
   - Init Vertex AI with project + region from env
   - Build Part objects from photo_urls
   - Call gemini-2.5-flash with VISION_PROMPT
   - Parse JSON response → AnalysisResult dict
   - Test: call directly with 2 Firebase Storage photo URLs

3. Verify McpToolset Firestore connection:
   - Set GOOGLE_APPLICATION_CREDENTIALS in .env
   - In adk web, ask: "Check the status of session abc123"
   - Agent should call firestore_get_document tool
   - Verify tool appears in the trace panel

Set all required environment variables in dax-agent/.env:
  GOOGLE_CLOUD_PROJECT, SURGE_API_KEY, SURGE_ACCOUNT_ID,
  NEXT_PUBLIC_APP_URL, GOOGLE_APPLICATION_CREDENTIALS
```

**Acceptance criteria:**
- [ ] `send_sight_link` delivers real SMS to test phone
- [ ] `analyze_photos` returns valid AnalysisResult JSON for test photos
- [ ] `firestore_get_document` MCP tool shows in ADK web trace
- [ ] No hardcoded secrets — all values from environment

---

### Task 16b — GroundingAgent Sub-Agent + A2A Wiring 🐍🔌
**Time:** 45 min | **Visual win:** ✅ Multi-agent delegation in trace panel
**Why this runs BEFORE deploy:** verifying agent-to-agent delegation locally in
`adk web` avoids a redeploy cycle if the wiring is wrong. Never deploy an
unverified multi-agent graph.

```
Build the GroundingAgent and wire it into EstimatorAgent per SSD v4 section 1.9.

1. Create dax-agent/dax_agent/agents/__init__.py:
   from .grounding_agent import grounding_agent

2. Create dax-agent/dax_agent/agents/grounding_agent.py EXACTLY from SSD v4
   section 1.9. It is an LlmAgent using the ADK built-in google_search tool.

3. Update dax-agent/dax_agent/agent.py per SSD v4 section 1.9:
   - Import: from google.adk.tools import AgentTool
   - Import: from .agents.grounding_agent import grounding_agent
   - Create: get_pricing_context = AgentTool(agent=grounding_agent)
   - Add get_pricing_context to root_agent tools list (before analyze_photos)
   - Use the updated SYSTEM_PROMPT (adds step 5b — call get_pricing_context)

4. Verify locally in adk web:
   - Ask: "I need a couch removed in Atlanta, GA 30311"
   - In the trace panel, confirm EstimatorAgent delegates to grounding_agent
   - Confirm grounding_agent calls google_search
   - Confirm a pricing-context JSON returns up the chain

Do NOT build a Vertex AI Search datastore. Google Search grounding is
sufficient for the demo and the grounding criterion. Vertex AI Search is a
labeled post-demo enhancement only.
```

**Acceptance criteria:**
- [ ] `grounding_agent.py` exists and uses `google_search`
- [ ] `get_pricing_context` (AgentTool) appears in EstimatorAgent's tool list
- [ ] adk web trace shows EstimatorAgent → grounding_agent → google_search chain
- [ ] grounding_agent returns valid pricing-context JSON
- [ ] No Vertex AI Search datastore built (deferred)

---

### Task 17 — ADK Deploy to Cloud Run 🐍⚙️
**Time:** 30 min

```
Deploy the dax-agent MULTI-AGENT system to Cloud Run using agents-cli.
Both EstimatorAgent (root) and GroundingAgent (sub) deploy together in one
container — they are a single ADK app.

  gcloud config set project YOUR_PROJECT_ID
  agents-cli deploy --project YOUR_PROJECT_ID --region us-central1

After deploy, retrieve the Cloud Run URL:
  gcloud run services describe dax-agent --region us-central1 \
    --format="value(status.url)"

Save it as DAX_AGENT_URL in hiredax/.env.local.

Verify: POST to {DAX_AGENT_URL}/run with a test message that triggers
grounding. Confirm the agent responds AND the grounding_agent delegation
trace appears in Cloud Logging.

Use --min-instances 1 to avoid cold starts during demo recording.
```

**Acceptance criteria:**
- [ ] Cloud Run service is ACTIVE
- [ ] POST to /run returns valid agent response
- [ ] grounding_agent delegation visible in Google Cloud Logging
- [ ] DAX_AGENT_URL set in Next.js .env.local
- [ ] `--min-instances 1` set to prevent cold-start delays

---

### Task 18 — Vapi Webhook → ADK Forwarder 🔌
**Time:** 25 min

```
Implement hiredax/app/api/vapi/webhook/route.ts per SSD section 1.8.

Events:
- call.started: create session in Firestore via Admin SDK
  (status: call_active, customerPhone from call metadata)
- tool.called: forward to DAX_AGENT_URL/run with session context
- call.ended: if status still call_active, mark as abandoned

Also build POST /api/quote/approve:
- Validate status === "pending_approval"
- Write approvedPrice + transition to quote_approved
- Return success

Also build GET /api/session/[token]:
- Return session data for portal SSR
```

---

### Task 19 — FCM Push Notifications 🔌
**Time:** 25 min | **Visual win:** ✅ Push notification fires

```
1. Request FCM permission on dashboard load
2. Save FCM token to operator Firestore document
3. After analyze_photos completes (in ADK agent tool or Next.js API),
   send FCM push: title "Estimate Ready", body "[Name] — tap to approve"
4. Fallback: audio chime via onSnapshot if FCM denied
```

---

### Task 20 — End-to-End Integration Test ✅
**Time:** 60 min | **Visual win:** ✅ Full golden thread working

Full call flow test (real phone, real Vapi, real Surge, real Gemini):
1. Call Vapi number → Dax answers
2. Dax sends SMS → open Sight Link on second phone
3. Upload 2 photos → Dax says "analyzing"
4. Dashboard push notification fires
5. Tap Approve → Dax reads price back
6. Accept booking → portal shows signature pad
7. Sign → rate experience

**Acceptance criteria:**
- [ ] All 7 steps complete without errors
- [ ] SMS arrives within 5 seconds
- [ ] Push notification fires within 5 seconds of analysis
- [ ] Quote readback matches approved price exactly
- [ ] Total call duration under 3 minutes

---

### Task 21 — Eval Set Run 🐍✅
**Time:** 30 min | **Visual win:** ✅ Eval report generated

```
Write dax-agent/eval/test_dax.py using agents-cli eval framework.
Load evalset.json from SSD section 1.14.
Run: agents-cli eval run

Review output:
- Expert Seal gate: should be 100% pass rate
- Grounding delegation (GroundingAgent called before estimate): 100% pass rate
- Vision accuracy: target ≥ 80%
- No hallucinated prices: should be 100% pass rate

Save the eval report as eval/eval-report.json for submission.
Include a screenshot in the architecture diagram slide.
```

---

### Task 22 — Architecture Diagram ✅
**Time:** 25 min | **Required submission deliverable**

Produce a clear diagram showing the MULTI-AGENT graph:
```
[Customer Phone Call]
       ↓
   [Vapi + Gemini 3.1 Flash Live]  ←— voice layer
       ↓ tool.called webhook
[Next.js API /vapi/webhook]        ←— Vercel
       ↓ HTTP POST /run
[ADK Multi-Agent System on Cloud Run]   ←— Google Cloud
   │
   ├── EstimatorAgent (root, gemini-2.5-flash)
   │     ├── send_sight_link tool      → [Surge.app SMS]
   │     ├── get_pricing_context       → delegates to ↓ GroundingAgent
   │     ├── analyze_photos tool        → [Vertex AI / Gemini 2.5 Flash Vision]
   │     └── McpToolset                 → [Google Managed Firestore MCP]
   │
   └── GroundingAgent (sub-agent, gemini-2.5-flash)
         └── google_search tool         → [Google Search grounding]
                                          ↓
                                    [Firestore DB]
                                       ↑      ↑
                          [Next.js Dashboard]  [Next.js Portal]
                          onSnapshot           onSnapshot
                          (Operator)           (Customer)
```

Label the EstimatorAgent → GroundingAgent edge "A2A delegation" — this is the
multi-agent collaboration the judges specifically evaluate.

Use Excalidraw, Mermaid, or Figma. Export as PNG for submission.

---

### Task 23 — Visual Polish 🎨
**Time:** 45 min | **Visual win:** ✅ Production-polished feel

```
1. Skeleton loading states on dashboard + portal
2. Empty states when no sessions exist
3. Fade-in on card appearance, slide-up on modals
4. Animated upload progress bar
5. Green checkmark pulse after Approve tap
6. Smooth StatusPill color transitions
7. Responsive check at 375px, 768px, 1024px
8. Disclaimer: bold yellow-bordered box on proposal card
```

---

### Task 24 — Deploy + Production Smoke Test ✅
**Time:** 30 min | **Visual win:** ✅ Live on production URL

```
1. Push all code to GitHub (public repo — required for submission)
2. Add LICENSE file (Apache 2.0 or MIT — required for submission)
3. Connect hiredax/ to Vercel, deploy
4. Set all Vercel environment variables
5. Update Vapi webhook URL to production Vercel domain
6. Run full Task 20 checklist on production URL
```

---

## QUICK REFERENCE: Task Execution Order

| # | Task | Type | Time | Visual Win? |
|---|---|---|---|---|
| 1 | Next.js scaffold (Fraunces/Manrope + full tokens) | ⚙️ | 15 min | |
| 2 | Shared UI components (+ Logo) | 🎨 | 35 min | ✅ |
| 3 | Marketing: private beta landing (+ footer + Login) | 🎨 | 35 min | ✅ |
| 4 | Mock data + types | ⚙️ | 10 min | |
| 5 | Onboarding wizard | 🎨 | 45 min | ✅ |
| 6 | Customer portal | 🎨 | 40 min | ✅ |
| 7 | Expert Seal feed | 🎨 | 40 min | ✅ |
| 8 | Schedule + Settings | 🎨 | 30 min | ✅ |
| 9 | Login page (UI) | 🎨 | 20 min | ✅ |
| 10 | Dashboard navigation | 🎨 | 15 min | ✅ |
| 11 | Firebase setup + Auth + seed (demo account) | ⚙️ | 30 min | |
| 12 | Wire portal → Firestore | 🔌 | 40 min | ✅ |
| 13 | Wire login + auth guard + dashboard → Firestore | 🔌 | 50 min | ✅ |
| 14 | Manual integration + login flow test | ✅ | 25 min | ✅ |
| 15 | ADK agent scaffold | 🐍 | 30 min | |
| 16 | MCP + tool implementation | 🐍🔌 | 45 min | ✅ |
| 16b | GroundingAgent + A2A wiring | 🐍🔌 | 45 min | ✅ |
| 17 | Deploy ADK multi-agent to Cloud Run | 🐍⚙️ | 30 min | |
| 18 | Vapi webhook → ADK forwarder | 🔌 | 25 min | |
| 19 | FCM push notifications | 🔌 | 25 min | ✅ |
| 20 | End-to-end integration test | ✅ | 60 min | ✅ |
| 21 | Eval set run | 🐍✅ | 30 min | ✅ |
| 22 | Architecture diagram | ✅ | 25 min | |
| 23 | Visual polish | 🎨 | 45 min | ✅ |
| 24 | Deploy + production smoke test | ✅ | 30 min | ✅ |

**Total: ~13 hours of active build time across 3 days**

First 35 min → branded marketing landing page on screen (first visual win).
First 4.75 hours → every screen visible with mock data, walkable in judge order
  (marketing → login → onboarding → dashboard → portal).
First 7.5 hours → real login works + real-time UIs connected to Firestore.
First 10 hours → ADK tools wired + Firestore MCP verified.
First 10.75 hours → GroundingAgent delegation verified locally (multi-agent live).
First 11.25 hours → multi-agent system on Cloud Run.
All 13 hours → full demo + eval report + architecture diagram.

---

## Competition Scoring Alignment

| Criterion | Weight | How HireDax Addresses It |
|---|---|---|
| **Technical Implementation** | 30% | ADK Python 2.0 **multi-agent system** (EstimatorAgent + GroundingAgent), agent-to-agent delegation via `AgentTool`, Google Managed Firestore MCP via McpToolset, **Google Search grounding**, Cloud Run deployment, Gemini Vision + Gemini voice, Vertex AI, eval set with quantified pass rates |
| **Business Case** | 30% | Real pain: home service businesses miss 40%+ of inbound calls. Dax captures every lead and grounds every quote in live regional pricing. ROI is immediate and measurable. |
| **Innovation & Creativity** | 20% | Voice + vision in one real-time call flow. Expert Seal gate as a safety constraint. Multi-agent collaboration: a specialized GroundingAgent makes estimates more reliable than a single agent could. Human-in-the-loop approval. |
| **Demo & Presentation** | 20% | 90-second golden thread. Clean production UI. Real call, real SMS, real photos, real grounded estimate, real approval, real booking. Architecture diagram shows the multi-agent graph. |

---

*HireDax SSD v4 — Updated June 8, 2026 — AmazingDotAi, LLC*
