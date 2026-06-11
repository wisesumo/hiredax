# HireDax — Build Plan v6 (Competition-Optimized)

> **Product:** HireDax — "Dax" AI voice + visual estimator agent for home service businesses.  
> **Challenge:** Google for Startups AI Agents Challenge — Track 1 (Net-New Agents).  
> **Hard deadline:** June 11, 2026, 5:00 PM PST. **Personal finish target:** EOD June 10.  
> **Architecture:** Two-service monorepo — Next.js (Vercel) + Python ADK multi-agent (Cloud Run).  
> **Build driver:** Claude Code in VS Code + Google Agents CLI skills installed.  
> **Updated:** June 8, 2026 (v6 — deadline corrected, multi-agent + grounding added for judging compliance).

---

## The Golden Thread (90-Second Demo Script)

This is the single loop judges need to see. Every build decision serves it.

1. Customer calls the business number (forwarded via *72).
2. Dax answers — Vapi + Gemini 3.1 Flash Live — warm, conversational.
3. Mid-call, Dax fires an SMS Sight Link via Surge.app.
4. Customer opens the zero-install PWA. Takes 1–3 photos.
5. Upload completes → Dax says "analyzing now."
6. ADK agent calls `analyze_photos` → Gemini 2.5 Flash Vision.
7. ADK agent calls Firestore MCP → reads `pending_approval` status.
8. Operator's phone buzzes — Expert Seal FCM push notification.
9. Operator taps **Approve & Release Quote** on the dashboard.
10. Firestore status → `quote_approved`. Dax reads the price back to the caller.
11. Caller accepts. ADK agent calls Firestore MCP → writes `booking_confirmed`.
12. Customer signs. Work order complete.

---

## Competition Submission Checklist

Required deliverables for Track 1 (confirm before June 11, 5:00 PM PST):

- [ ] **Code** — Public GitHub repo with full monorepo (hiredax/ + dax-agent/)
- [ ] **LICENSE** — Apache 2.0 or MIT at repo root
- [ ] **Video** — Demo of the full golden thread above
- [ ] **Architecture diagram** — Shows ADK agent, MCP connections, Firestore, Cloud Run, Vapi
- [ ] **Testing access** — Production Vercel URL + seeded demo operator login credentials (judges click "Operator Login" on the landing page and sign in to reach the live demo)

---

## What Ships vs. What's Deferred

### Ships — Working Code for the Demo

| Component | Technology | Purpose |
|---|---|---|
| Voice agent | Vapi + Gemini 3.1 Flash Live | Answers the call, drives conversation |
| EstimatorAgent (Dax) | Python ADK 2.0, Cloud Run | Root orchestrator — drives call flow, Expert Seal gate |
| GroundingAgent | Python ADK 2.0, sub-agent | Grounds pricing in real-time market data via Google Search |
| Firestore MCP | Google Managed Firestore MCP (GA) | Agent reads/writes session state via MCP |
| SMS | Surge.app (ADK function tool) | Fires Sight Link mid-call |
| Vision | Gemini 2.5 Flash Vision (ADK function tool) | Analyzes photos, generates estimate |
| Google Search grounding | ADK built-in Google Search tool | GroundingAgent retrieves real-time market pricing |
| Vertex AI Search | (Deferred to V2) | Internal pricing datastore — wired-but-optional, NOT built for the demo |
| Marketing site | Next.js, Vercel | Private beta landing (hero + waitlist + footer + Operator Login) |
| Operator dashboard | Next.js, Vercel | Expert Seal feed, schedule, settings (auth-guarded) |
| Customer portal | Next.js, Vercel | Sight Link PWA — photos, proposal, signature |
| Firestore (UI layer) | Firebase client SDK | Real-time `onSnapshot` in dashboard + portal |
| Firebase Storage | Firebase | Customer photo storage |
| Firebase Auth | Firebase | Operator login — REAL judge access path (demo seed account) |
| FCM | Firebase Cloud Messaging | Expert Seal push notification |
| Eval set | agents-cli eval | 10-case report for submission evidence |
| Architecture diagram | Excalidraw/Mermaid | Required submission deliverable |

### V1 Shortcuts (Scope Decisions Applied)

| Full Spec | V1 Reality |
|---|---|
| Invoice ingestion + Gemma 4 parsing | Standard pricing tables, manual text input |
| Grouped estimate batching | Every call fires instant push, single-threaded |
| Full autonomous mode | Static "Autonomous Mode (V2 Preview)" label only |
| Offline Service Worker + IndexedDB | Standard HTML5 on active connection |
| Multi-work-order customer history | Single active job view per session token |
| Live GPS progress tracker | Removed entirely |
| Dynamic scheduling matrix | Static: "truck available 2–4 PM today" |
| Estimator config UI | Hardcoded baseline values in Firestore seed |
| SMS OTP return access | Tokenized magic link, single session |
| Team seat permissions | Hidden; Vapi config in env vars |
| Dynamic phone forwarding UI | Text input + *72 Instruction Card |
| ADK graph-based multi-agent | Two-agent system: EstimatorAgent (Dax) + GroundingAgent — required for judging compliance |

---

## Architecture Diagram (Text Form)

```
┌─────────────────────────────────────────────────────────────┐
│                      GOOGLE CLOUD                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         ADK Multi-Agent System (Cloud Run)           │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │   EstimatorAgent (root_agent / Dax)         │    │   │
│  │  │   LlmAgent (gemini-2.5-flash)               │    │   │
│  │  │   ┌─────────────────────────────────────┐   │    │   │
│  │  │   │ send_sight_link (function tool)     │───┼────┼───┼──► Surge.app SMS
│  │  │   ├─────────────────────────────────────┤   │    │   │
│  │  │   │ analyze_photos (function tool)      │───┼────┼───┼──► Vertex AI
│  │  │   ├─────────────────────────────────────┤   │    │   │    Gemini 2.5 Flash
│  │  │   │ McpToolset (Firestore MCP)          │───┼────┼───┼──► Google Managed
│  │  │   ├─────────────────────────────────────┤   │    │   │    Firestore MCP
│  │  │   │ grounding_agent (sub-agent call)    │──►│    │   │
│  │  │   └─────────────────────────────────────┘   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                         │ delegates to               │   │
│  │  ┌──────────────────────▼──────────────────────┐    │   │
│  │  │   GroundingAgent (sub-agent)                │    │   │
│  │  │   LlmAgent (gemini-2.5-flash)               │    │   │
│  │  │   ┌─────────────────────────────────────┐   │    │   │
│  │  │   │ google_search (built-in ADK tool)   │───┼────┼───┼──► Google Search
│  │  │   ├─────────────────────────────────────┤   │    │   │    (real-time pricing)
│  │  │   │ vertex_search (ADK tool)            │───┼────┼───┼──► Vertex AI Search
│  │  │   └─────────────────────────────────────┘   │    │   │    (pricing datastore)
│  │  └─────────────────────────────────────────────┘    │   │
│  └──────────────────────────┬───────────────────────────┘   │
│                             │ HTTP /run                      │
│             │               │               │                │
│  ┌──────────┴───────────┐   │         ┌────┴──────┐         │
│  │ Next.js API (Vercel) │   │         │ Firestore │         │
│  │ /api/vapi/webhook    │   │         │  Database │         │
│  │ /api/quote/approve   │   │         └────┬──────┘         │
│  └──────────────────────┘   │              │                │
│             ▲               │       onSnapshot × 2          │
└─────────────┼───────────────┼──────────────┼────────────────┘
              │               │              │
         Vapi webhook    (Cloud Run)   Dashboard + Portal
              │
    ┌─────────┴──────────┐
    │  Vapi + Gemini     │
    │  3.1 Flash Live    │
    │  (voice layer)     │
    └─────────┬──────────┘
              │ inbound call
    ┌─────────┴──────────┐
    │    Customer Phone  │
    └────────────────────┘
```

### Why Two Agents Are Better Than One

The judges specifically evaluate whether "the collaboration between agents leads to a more powerful solution than a single agent could achieve." Here is HireDax's answer:

- **EstimatorAgent** orchestrates the live call, drives the customer through the photo flow, enforces the Expert Seal gate, and manages the Firestore session. It is optimized for real-time conversational responsiveness.
- **GroundingAgent** is a specialized sub-agent delegated to only one task: retrieve accurate, current market pricing context (junk removal rates by region, heavy item surcharges, seasonal demand) from Google Search and the Vertex AI Search pricing datastore. It returns a grounded pricing context object that EstimatorAgent feeds into `analyze_photos`.
- **The collaboration win:** Without GroundingAgent, `analyze_photos` uses static pricing formulas. With GroundingAgent, estimates are grounded in real-time regional market data — a more reliable, hallucination-resistant result that a single agent with static prompts could not achieve alone.

---

## Day-by-Day Execution

### Day 1 — Monday, June 8 (Today): Visual Foundation + ADK Scaffold

**Time budget: 6–7 hours**
**Goal:** Every frontend screen visible with mock data. ADK agent scaffolded locally.

Run two parallel tracks. Start the frontend track, and use wait time (npm install, etc.) to scaffold the ADK agent.

#### Frontend Track (Tasks 1–10, ~4.5 hours)

| Block | Task | Time | Visual Win? |
|---|---|---|---|
| 1.1 | Next.js scaffold, Tailwind, design system CSS (Fraunces/Manrope) | 15 min | |
| 1.2 | Shared UI component library (+ Logo) | 35 min | ✅ |
| 1.3 | Marketing: private beta landing (hero + waitlist + footer + Operator Login) | 35 min | ✅ |
| 1.4 | Mock data + TypeScript types | 10 min | |
| 1.5 | Onboarding wizard (7 steps) | 45 min | ✅ |
| 1.6 | Customer portal (all states) | 40 min | ✅ |
| 1.7 | Expert Seal live feed | 40 min | ✅ |
| 1.8 | Schedule + Settings pages | 30 min | ✅ |
| 1.9 | Login page (UI; real auth wired Day 2 Task 13) | 20 min | ✅ |
| 1.10 | Dashboard layout + tab navigation | 15 min | ✅ |

#### Agent Track (Task 15, ~45 min — run during npm installs)

```bash
# In a second terminal, dax-agent/ directory
pip install uv
uvx google-agents-cli setup   # installs Agents CLI + Claude Code skills
agents-cli create dax-agent --agent adk -d cloud_run --yes
cd dax-agent
uv sync
```

Then replace scaffolded files with SSD section 1.9 code (Day 1 scaffolds the
root EstimatorAgent only; GroundingAgent is added Day 2 Task 16b):
- `dax_agent/agent.py` — EstimatorAgent (LlmAgent) with McpToolset for Firestore MCP
- `dax_agent/tools/send_sight_link.py`
- `dax_agent/tools/analyze_photos.py`
- `dax_agent/agents/__init__.py` — empty (GroundingAgent lands here Day 2)

Verify locally:
```bash
adk web
# Open http://localhost:8080
# Send: "I need to get rid of a couch"
# Agent should respond and attempt tool calls
```

**End of Day 1:** Every screen visible with mock data, walkable in judge order
(marketing landing → Operator Login → onboarding → dashboard → customer portal).
EstimatorAgent running locally in the ADK web UI. ~6 hours.

---

### Day 2 — Tuesday, June 9: Wiring Everything Together

**Time budget: 5.5–6 hours**
**Goal:** Real-time Firestore driving both UIs. ADK agent deployed to Cloud Run. Full call flow working end-to-end. Working MVP complete by midnight.

| Block | Task | Time | Visual Win? |
|---|---|---|---|
| 2.1 | Firebase setup + security rules + seed script | 25 min | |
| 2.2 | Wire portal to Firestore (real-time + photo upload) | 40 min | ✅ |
| 2.3 | Wire dashboard to Firestore (real-time + approve) | 40 min | ✅ |
| 2.4 | Manual integration test (both UIs react) | 20 min | ✅ |
| 2.5 | ADK tools — implement send_sight_link + analyze_photos | 45 min | ✅ |
| 2.6 | **GroundingAgent — build sub-agent with Google Search + Vertex AI Search tools** | 30 min | |
| 2.7 | **Wire EstimatorAgent → GroundingAgent delegation (agent-to-agent call)** | 20 min | |
| 2.8 | Verify Firestore MCP connection in adk web | 15 min | |
| 2.9 | Deploy ADK multi-agent system to Cloud Run | 30 min | |
| 2.10 | Vapi webhook → ADK forwarder + /api/quote/approve | 25 min | |
| 2.11 | FCM push notifications | 25 min | ✅ |
| 2.12 | End-to-end test — full manual call flow | 60 min | ✅ |

**Claude Code prompt for Day 2 morning:**
```
Read CLAUDE.md, HIREDAX_SSD_v4.md, and HIREDAX_BUILD_PLAN_v6.md. We are on Day 2.
All frontend screens are built and working with mock data; the EstimatorAgent
talks locally.

In hiredax/ (Terminal 1): do Tasks 11, 12, 13, 14 in order (Firebase + wiring).
In dax-agent/ (Terminal 2): do Tasks 16, 16b, 17 (real tools, GroundingAgent,
Cloud Run). Build the GroundingAgent and verify the EstimatorAgent ->
GroundingAgent delegation locally BEFORE deploying.
Then converge on Tasks 18, 19, 20 to close the Golden Thread.
```

**End of Day 2:** Real-time UIs live. ADK multi-agent system (EstimatorAgent + GroundingAgent) on Cloud Run. Full golden thread working end-to-end. Working MVP complete. ~7 hours.

---

### Day 3 — Wednesday, June 10: Eval + Polish + Deploy + Video Recording

**Time budget: 6–7 hours**
**Goal:** Eval report generated. App polished. Architecture diagram complete. Production deployment verified. Demo video recorded.

| Block | Task | Time | Visual Win? |
|---|---|---|---|
| 3.1 | Eval set — write + run agents-cli eval | 30 min | ✅ |
| 3.2 | Architecture diagram (Excalidraw or Mermaid) | 25 min | |
| 3.3 | Visual polish — skeletons, transitions, empty states | 45 min | ✅ |
| 3.4 | Fallback flows — photo timeout, Gemini error, call drop | 30 min | |
| 3.5 | Push to GitHub — verify public repo + LICENSE file | 15 min | |
| 3.6 | Deploy to Vercel — update env vars, production smoke test | 20 min | ✅ |
| 3.7 | Production end-to-end test (full golden thread on prod URL) | 30 min | ✅ |
| 3.8 | Write narration script (use golden thread above) | 30 min | |
| 3.9 | Record 3–4 complete demo runs on stable Wi-Fi | 60 min | |
| 3.10 | Edit — pick cleanest take, add narration, trim to length | 90 min | |

**End of Day 3:** Demo-ready. Eval report saved. Architecture diagram exported. Production URL verified. Demo video recorded and edited. No new code after midnight.

---

### Day 4 — Thursday, June 11: Submission Day

**Time budget: 3–4 hours (morning only — submit well before 5:00 PM PST)**
**Goal:** Submission package complete and confirmed before the hard deadline.**HARD DEADLINE: 5:00 PM PST June 11, 2026. NO EXCEPTIONS.**

| Block | What | Time |
|---|---|---|
| 4.1 | Finalize GitHub README (setup instructions, architecture, eval results, multi-agent explanation) | 20 min |
| 4.2 | Final video review — confirm upload complete and playable | 20 min |
| 4.3 | Prepare Devpost submission form — fill all fields, attach deliverables, add architecture diagram | 30 min |
| 4.4 | Submit — confirm receipt **well before 5:00 PM PST** | 10 min |
| 4.5 | Buffer — handle any last-minute submission portal issues | 60 min |

**NO new code on June 11. Review and submit only.**

---

## Claude Code Session Patterns

### Session Starter (paste at start of every session)

```
Read CLAUDE.md, HIREDAX_SSD_v4.md, and HIREDAX_BUILD_PLAN_v6.md.
We are building HireDax — the two-service monorepo with Next.js (hiredax/)
and a Python ADK multi-agent (dax-agent/). I am working in hiredax/ right now.
Current task: [paste task number and name from SSD].
Read the task instructions exactly and build to its acceptance criteria.
```

### ADK-Specific Session Starter (for dax-agent/ work)

```
Read dax-agent/DESIGN_SPEC.md and HIREDAX_SSD_v4.md sections 1.9 and
Tasks 15–17. We are building the Python ADK multi-agent for HireDax:
EstimatorAgent (root) + GroundingAgent (sub-agent via AgentTool).
The agent uses google-adk v2.2.0, McpToolset with Google Managed
Firestore MCP, google_search grounding, and deploys to Cloud Run via agents-cli.
Current task: [paste task].
```

---

## Google Ecosystem Usage (for Architecture Diagram + Submission)

| Google Service | How It's Used | Where |
|---|---|---|
| **Gemini 3.1 Flash Live** | Voice conversation model via Vapi | Real-time call layer |
| **Gemini 2.5 Flash** | LLM backing EstimatorAgent (root) and GroundingAgent (sub) | Both ADK agents |
| **Gemini 2.5 Flash Vision** | Photo analysis via Vertex AI | `analyze_photos` tool |
| **Vertex AI** | Hosts Gemini models, ADK agent runtime | ADK + Vision |
| **Google ADK Python 2.0** | Agent framework — LlmAgent, AgentTool (sub-agent wiring) | dax-agent/ |
| **Google Search (ADK built-in)** | GroundingAgent retrieves real-time regional pricing | GroundingAgent tool |
| **Vertex AI Search** | GroundingAgent queries internal pricing datastore | GroundingAgent tool |
| **Google Managed Firestore MCP** | Session state read/write via MCP protocol | McpToolset in EstimatorAgent |
| **Firestore** | Database for sessions + operators | Both services |
| **Firebase Storage** | Customer photo storage | Portal upload |
| **Firebase Auth** | Operator login | Dashboard |
| **Firebase Cloud Messaging** | Expert Seal push notification | Dashboard |
| **Cloud Run** | Hosts the ADK multi-agent system | dax-agent deploy |
| **Google Cloud Logging** | Agent execution traces (via ADK) | Production observability |
| **agents-cli** | Scaffold + eval + deploy lifecycle | Dev toolchain |

---

## Multi-Agent Implementation (NEW — Required for Judging Compliance)

### Competition Requirement

The judging criteria explicitly requires demonstrating that "the collaboration between agents leads to a more powerful and capable solution than a single agent could achieve." This section specifies the minimal two-agent system that satisfies this requirement without derailing the build timeline.

### GroundingAgent — Code Spec

**File:** `dax-agent/dax_agent/agents/grounding_agent.py`

```python
"""
GroundingAgent — HireDax pricing context retrieval sub-agent.
Called by EstimatorAgent before analyze_photos to ground pricing in real market data.
"""
from google.adk.agents import LlmAgent
from google.adk.tools import google_search
import vertexai
from vertexai.preview import rag

GROUNDING_PROMPT = """
You are a pricing research agent for a junk removal business.
When called with a job description and location, retrieve:
1. Current market rates for junk removal in that region (use google_search)
2. Any regional surcharge norms (heavy items, stairs, interior access)

Return ONLY a JSON object:
{
  "base_rate_per_cubic_yard": float,
  "heavy_item_surcharge": float,
  "interior_surcharge": float,
  "stairs_surcharge": float,
  "regional_context": "one-sentence summary of local market"
}
"""

grounding_agent = LlmAgent(
    name="grounding_agent",
    model="gemini-2.5-flash",
    instruction=GROUNDING_PROMPT,
    tools=[google_search],   # ADK built-in Google Search grounding tool
)
```

### EstimatorAgent (Updated) — Sub-Agent Wiring

**File:** `dax-agent/dax_agent/agent.py` (updated section)

```python
from google.adk.agents import LlmAgent
from google.adk.tools import AgentTool
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset, SseServerParams
from .tools.send_sight_link import send_sight_link
from .tools.analyze_photos import analyze_photos
from .agents.grounding_agent import grounding_agent

FIRESTORE_MCP_URL = "https://firestore.googleapis.com/mcp/v1"

firestore_mcp = McpToolset(
    connection_params=SseServerParams(url=FIRESTORE_MCP_URL),
    tool_filter=["firestore_get_document", "firestore_update_document"],
)

# Wrap grounding_agent as a tool callable by EstimatorAgent
grounding_tool = AgentTool(agent=grounding_agent)

root_agent = LlmAgent(
    name="dax",
    model="gemini-2.5-flash",
    instruction=SYSTEM_PROMPT,  # unchanged from SSD v3
    tools=[
        send_sight_link,
        analyze_photos,
        grounding_tool,     # ← delegates to GroundingAgent for pricing context
        firestore_mcp,
    ],
)
```

### Day 2 Task 2.6 — Build GroundingAgent (30 min)

```
TASK 2.6 — GroundingAgent Sub-Agent

Create dax-agent/dax_agent/agents/__init__.py (empty).
Create dax-agent/dax_agent/agents/grounding_agent.py using the code above.

The GroundingAgent uses google_search (ADK built-in tool) to retrieve
real-time junk removal pricing for the caller's region before analyze_photos
is called. This grounds the estimate in actual market data rather than
static formulas.

Verify in adk web: ask EstimatorAgent "What do junk removal companies
charge in Atlanta GA?" — EstimatorAgent should delegate to GroundingAgent
and return a grounded pricing context JSON.
```

### Day 2 Task 2.7 — Wire Agent-to-Agent Delegation (20 min)

```
TASK 2.7 — EstimatorAgent → GroundingAgent Wiring

Update dax-agent/dax_agent/agent.py:
1. Import grounding_agent from agents/grounding_agent.py
2. Wrap as AgentTool: grounding_tool = AgentTool(agent=grounding_agent)
3. Add grounding_tool to root_agent tools list
4. Update SYSTEM_PROMPT to instruct EstimatorAgent to call get_pricing_context
   (the grounding_agent tool name) after understanding the job location and
   before calling analyze_photos.

Update SYSTEM_PROMPT instruction between steps 5 and 6:
  "5b. Call get_pricing_context with job description and customer zip code.
       Use the returned base_rate_per_cubic_yard in your pricing context."

Verify: full call in adk web triggers grounding_agent delegation trace.
```

---

## Submission Narrative — Multi-Agent Collaboration Statement

> Include this in the Devpost submission text description under "Architecture":
>
> HireDax uses a two-agent ADK system deployed on Cloud Run. The **EstimatorAgent** (Dax) orchestrates the live customer call, manages the Expert Seal gate via Firestore MCP, and coordinates photo analysis via Gemini Vision. Before generating any estimate, EstimatorAgent delegates to the **GroundingAgent** — a specialized sub-agent that uses Google Search and Vertex AI Search to retrieve real-time regional junk removal pricing. The GroundingAgent returns a structured pricing context object that EstimatorAgent feeds into `analyze_photos`, grounding the estimate in actual market data rather than static formulas. This collaboration produces a more reliable, hallucination-resistant price than a single agent with hardcoded pricing could achieve.

---

## Budget

| Service | Expected Spend (3-day build + demo) |
|---|---|
| Vapi (voice calls during dev) | $5–15 |
| Surge.app (SMS) | $2–5 |
| Vertex AI / Gemini Vision | $3–8 |
| Cloud Run (ADK agent) | $0–2 (within free tier at low volume) |
| Firebase (Spark → Blaze) | $0–3 |
| Vercel (Pro — commercial use) | $20/mo |
| **Total** | **~$30–53** |

Google for Startups $500 credit covers all Google Cloud costs during dev.

---

## Risk Register

| Risk | Mitigation |
|---|---|
| Firestore MCP null-field bug (known issue) | Test with populated sessions only. Ensure all optional fields have default values in seed script. |
| Vapi webhook timing under real call load | Pre-warm Cloud Run with 2 test calls before recording. Use `--min-instances 1` on Cloud Run. |
| Gemini Vision returns non-JSON | Wrap `analyze_photos` in try/except. Hardcode fallback AnalysisResult for demo safety. |
| Cloud Run cold start on first call | Set `--min-instances 1` in Cloud Run deployment or pre-warm before demo recording. |
| Surge SMS delivery delay | Test with real phone number Day 2. Have fallback: manually open the portal URL on camera during recording. Video recorded Day 3 — gives full Day 2 to resolve any SMS issues before recording. |
| agents-cli eval fails on Firestore MCP tools | Mock the Firestore MCP responses in eval/test_dax.py for tools that require a live DB. |
| GitHub repo not public at submission | Create repo as public from day one. Confirm LICENSE file is at root. |

---

## Estimated Time Summary

| Day | Date | Focus | Hours |
|---|---|---|---|
| Day 1 | Mon June 8 | Frontend (Tasks 1–10) + ADK scaffold (Task 15) | 6.0 |
| Day 2 | Tue June 9 | Firebase wiring (11–14) + ADK tools + GroundingAgent + Cloud Run (16–19) + E2E test (20) | 7.0 |
| Day 3 | Wed June 10 | Eval (21) + Architecture diagram (22) + Polish (23) + Deploy (24) + Video | 7.0 |
| Day 4 | Thu June 11 | Submission only — no new code — **submit before 5 PM PST** | 3.0 |
| **Total** | | | **~23 hours** |

First 35 min → branded private beta landing page on screen (first visual win).
First 4.75 hours → every screen on screen with mock data, walkable in judge
  order (marketing → login → onboarding → dashboard → portal).
First 7.5 hours → real login works + real-time Firestore driving both UIs.
First 11 hours → multi-agent system on Cloud Run + full golden thread end-to-end.
First 18 hours → submission-complete with eval report + video.
All 22 hours → submitted and confirmed before June 11 deadline.

---

*HireDax Build Plan v6 — Updated June 8, 2026 — AmazingDotAi, LLC*
