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

## Build Status
- [x] Day 1 (Task 15): EstimatorAgent scaffold — send_sight_link, analyze_photos, Firestore MCP
- [ ] Day 2 (Task 16b): GroundingAgent sub-agent + A2A wiring via AgentTool
- [ ] Day 2 (Task 17): Deploy to Cloud Run via agents-cli
