# HireDax — Project Constitution for Claude Code

## What You're Building
HireDax is a real-time AI voice agent and visual estimator for home service
businesses. An AI agent named Dax answers inbound phone calls, sends an SMS
camera link mid-call, analyzes customer-uploaded photos with Gemini Vision,
generates an itemized estimate, and routes it to the operator for one-tap
approval before any price is spoken to the caller.

## Non-Negotiable Safety Rule
**Expert Seal Gate:** No price may EVER be spoken to a caller without a
verified operator approval token. Every code path that could deliver a price
to a customer MUST check `status === "quote_approved"` in Firestore before
proceeding. This is a constitutional constraint, not a feature.

## Tech Stack (Locked — Do Not Deviate)

### Frontend service — hiredax/ (Next.js, Vercel)
- Framework: Next.js 14 App Router
- Language: TypeScript (strict mode, no `any` types)
- Styling: Tailwind CSS + custom CSS tokens in styles/design-system.css
- Database: Firestore ONLY (no Cloud SQL, no SQLite, no other DB)
- File storage: Firebase Storage
- Auth: Firebase Auth
- Voice: Vapi + Gemini 3.1 Flash Live
- SMS: Surge.app API (called from the ADK agent, not the frontend)
- Vision: Gemini 2.5 Flash via Vertex AI (called from the ADK agent)
- Push: Firebase Cloud Messaging (FCM)
- Hosting: Vercel (frontend), Firebase (backend services)

### Agent service — dax-agent/ (Python ADK, Cloud Run)
- Runtime: Python 3.11+, package manager `uv`
- Framework: google-adk v2.2.0 (ADK Python 2.0 GA) — YES, actually build and
  import this. The ADK agent is a core deliverable, not a diagram-only mention.
- Architecture: MULTI-AGENT — EstimatorAgent (root LlmAgent) + GroundingAgent
  (sub-agent wired via AgentTool). This is required for competition judging.
- Model: Gemini 2.5 Flash via Vertex AI (both agents)
- MCP: McpToolset → Google Managed Firestore MCP (session state)
- Grounding: google_search (ADK built-in tool, inside GroundingAgent)
- Deployment: Cloud Run via `agents-cli deploy`

Do NOT suggest or install any package not in this stack. When working in
hiredax/ use only the frontend stack; when working in dax-agent/ use only the
agent stack. Do not mix Python into the Next.js app or vice versa.

## Design System (Non-Negotiable — Finalized Fraunces/Manrope System)
All CSS values must reference tokens from styles/design-system.css (full set in
SSD v4 section 1.4). The palette is bone/navy/green with stone accents:
- --color-bone: #F5F2ED (app + marketing background)
- --color-bone-deep: #EDE8E0 (sunken surfaces)
- --color-navy: #1B2238 (primary text, headers, inverse cards, sidebar)
- --color-green: #7CD96B (primary CTAs, approve button, accents)
- --color-green-light: #D9F5D3 (approved badge bg)
- --color-stone: #8C8579 (secondary text, pending badge)
- --color-white: #FFFFFF (card surfaces)
- Status colors: navy = active/inbound, stone = pending, green = approved;
  warning #FFF8E1/#7A5A00, error #FEF2F2/#DC3545 (see SSD 1.6a)
- Fonts: Fraunces (300/400/600/700, display/headings), Manrope
  (300/400/500/600/700, body + UI)
- Logo: the "Hire"+"Dax" wordmark with lifted "Dax" + green underline accent —
  identical across marketing, login, and dashboard
- Minimum touch target: 48×48px on ALL interactive elements

Do NOT use hardcoded hex values. Reference CSS variables only. Do NOT use the
old Playfair Display / DM Sans / electric-blue / teal tokens — they are retired.

## Application Surfaces
The product builds and is walked in this order (marketing → app):
1. **Marketing landing page — /** (PUBLIC): private beta hero + waitlist form +
   footer (copyright, Terms, Privacy, social) + an **Operator Login button**
   that is the judge access point.
2. **Operator login — /login** (Firebase Auth — REAL, demo-critical): judges
   sign in here with seeded test credentials to reach the live demo.
3. Operator onboarding wizard (7 steps) — /onboarding
4. Operator dashboard with 3 tabs — /dashboard (AUTH-GUARDED):
   - Work Orders / Expert Seal feed (primary mobile view)
   - Schedule / Job Log
   - Settings (includes Sign Out)
5. Customer portal (zero-install PWA) — /portal/[token] (token-gated, no auth)

## Authentication (Non-Negotiable — Demo-Critical)
Login is a REAL working path, not a placeholder. Judges use it to reach the demo.
- Firebase Auth `signInWithEmailAndPassword`; persistence = browserLocalPersistence.
- `lib/auth-context.tsx` AuthProvider exposes { operator, loading, signOut } via
  onAuthStateChanged and wraps the app in the root layout.
- `middleware.ts` + dashboard layout guard: logged-out hits to /dashboard/* →
  /login; logged-in hits to /login → /dashboard.
- The Task 11 seed script creates a real demo operator auth user
  (onboardingComplete: true) whose uid owns the seeded operator doc + sessions,
  so judges land on a populated dashboard. Credentials go in the README +
  Devpost testing field.
- Never fake a dashboard redirect that bypasses auth.

## Agent Architecture (dax-agent/ — Non-Negotiable)
HireDax is a MULTI-AGENT system. This is a competition requirement, not optional.
- **EstimatorAgent** (root, "Dax"): orchestrates the call, enforces the Expert
  Seal gate, manages Firestore session state via MCP. Tools: send_sight_link,
  get_pricing_context (delegates to GroundingAgent), analyze_photos, firestore MCP.
- **GroundingAgent** (sub-agent): retrieves real-time regional junk-removal
  pricing via the ADK built-in google_search tool. Wired into EstimatorAgent
  as an AgentTool. Always called before analyze_photos.
- The agent-to-agent delegation (EstimatorAgent → GroundingAgent) is the
  collaboration the judges evaluate. Do not collapse this into a single agent.
- Do NOT build a Vertex AI Search datastore before the demo — Google Search
  grounding alone satisfies the grounding criterion. Vertex AI Search is a
  labeled post-demo enhancement only.

## Session State Machine
call_active → link_sent → photos_uploading → photos_complete
→ analysis_running → pending_approval → quote_approved
→ quote_delivered → booking_confirmed → work_order_signed
→ job_complete → rated

Transitions are FORWARD ONLY. Every transition writes status + updatedAt
to Firestore atomically.

## Coding Rules
1. TypeScript strict mode. No `any`. No type assertions unless documented.
2. Every component is mobile-first (375px → 768px → 1024px).
3. All interactive elements: minimum 48×48px touch target.
4. No external component libraries (no MUI, no shadcn, no Radix).
   Use shared primitives from components/ui/ only.
5. No hardcoded colors or font sizes — use CSS variables.
6. Error states, loading states, and empty states are required for every
   data-dependent component.
7. After completing any task, list what you built and which acceptance
   criteria from the SSD it satisfies.

## Deferred to V2 — Do Not Build These
- Historical invoice ingestion
- Grouped estimate batching
- Autonomous mode (show as static "V2 Preview" label only)
- Offline Service Worker / IndexedDB
- Multi-work-order customer history
- Live GPS progress tracker
- Dynamic scheduling agent matrix
- Estimator config UI with zip code multipliers
- SMS OTP customer return access
- Multi-seat team permissions
- Dynamic phone number forwarding UI
- Vertex AI Search datastore (GroundingAgent uses google_search only for V1)
- Graph-based ADK workflows beyond the two-agent EstimatorAgent + GroundingAgent
- Cloud SQL / Postgres
- Redis / any caching layer

> NOTE: The ADK agent itself is NOT deferred. Build EstimatorAgent and
> GroundingAgent fully — they are core deliverables. Only the items above are
> out of scope for V1.

## Reference Files
- HIREDAX_SSD_v4.md — full spec, TypeScript interfaces, Firestore schema,
  API contracts, component specs, multi-agent code, all 25 tasks (1–16b, 17–24)
- HIREDAX_BUILD_PLAN_v6.md — day-by-day execution plan
- HIREDAX_DAY1_PLAYBOOK_v3.md — Day 1 hour-by-hour operational playbook
- HIREDAX_DAY2_PLAYBOOK.md — Day 2 hour-by-hour operational playbook

Read the SSD before starting any new feature or component.
