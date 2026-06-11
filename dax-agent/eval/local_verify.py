"""
Task 16b local verification — scripted conversation against the full
multi-agent system (same Runner engine adk web uses), printing the complete
event trace.

Exercises: send_sight_link → get_pricing_context (GroundingAgent →
google_search) → analyze_photos (Gemini Vision on the seeded session's
photos) → estimate composed → status pending_approval written via the
Firestore MCP tools → Expert Seal gate refuses to quote while pending.

Run:  uv run python eval/local_verify.py
"""
import asyncio
import os
import sys

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

SESSION_TOKEN = "demo-session-001"

# Real photos so Gemini Vision has something to identify
SEED_PHOTOS = [
    "https://commons.wikimedia.org/wiki/Special:FilePath/Couch.jpg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Mattress.jpg",
]

TURNS = [
    # 1 → expect send_sight_link
    (
        "Hi, this is Marcus Johnson. I need a couch and a mattress removed "
        "from my basement in Atlanta, GA 30311. My phone number is "
        "+14045550199. (System note: the session token for this call is "
        f"{SESSION_TOKEN}.)"
    ),
    # 2 → expect get_pricing_context THEN analyze_photos THEN
    #     update_document(status=pending_approval)
    (
        f"(System note: the customer's photos for session {SESSION_TOKEN} "
        "have been uploaded and the session status is photos_complete. "
        "Proceed with the estimate workflow now.)"
    ),
    # 3 → Expert Seal gate: status is pending_approval, so Dax must refuse
    ("So what's the total going to cost me? Just give me the number."),
]


def seed_session() -> None:
    """Make sure the demo session exists with photos_complete + real photos."""
    from google.cloud import firestore

    db = firestore.Client(project=os.environ["GOOGLE_CLOUD_PROJECT"])
    db.collection("sessions").document(SESSION_TOKEN).set(
        {
            "token": SESSION_TOKEN,
            "portalToken": SESSION_TOKEN,
            "operatorId": "local-verify",
            "customerName": "Marcus Johnson",
            "customerPhone": "+14045550199",
            "status": "photos_complete",
            "photoUrls": SEED_PHOTOS,
            "analysisResult": None,
            "approvedPrice": None,
            "updatedAt": firestore.SERVER_TIMESTAMP,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
    )
    print(f"[seed] sessions/{SESSION_TOKEN} ready (photos_complete, "
          f"{len(SEED_PHOTOS)} photos)\n")


def print_event(event) -> None:
    author = getattr(event, "author", "?")
    content = getattr(event, "content", None)
    for part in (content.parts if content and content.parts else []):
        if part.function_call:
            args = str(dict(part.function_call.args or {}))
            print(f"  [{author}] → TOOL CALL {part.function_call.name}"
                  f"({args[:300]})")
        elif part.function_response:
            resp = str(part.function_response.response)
            print(f"  [{author}] ← TOOL RESULT {part.function_response.name}: "
                  f"{resp[:300]}")
        elif part.text and part.text.strip():
            print(f"  [{author}] TEXT: {part.text.strip()[:400]}")


async def main() -> None:
    seed_session()

    from google.adk.runners import Runner
    from google.adk.sessions import InMemorySessionService
    from google.genai import types

    from dax_agent.agent import root_agent

    session_service = InMemorySessionService()
    await session_service.create_session(
        app_name="dax-app", user_id="verify", session_id="verify-1"
    )
    runner = Runner(
        agent=root_agent, app_name="dax-app", session_service=session_service
    )

    for i, turn in enumerate(TURNS, 1):
        print(f"\n=== TURN {i} ===\nUSER: {turn}\n--- event trace ---")
        async for event in runner.run_async(
            user_id="verify",
            session_id="verify-1",
            new_message=types.Content(
                role="user", parts=[types.Part.from_text(text=turn)]
            ),
        ):
            print_event(event)

    # Confirm the MCP write landed
    from google.cloud import firestore

    db = firestore.Client(project=os.environ["GOOGLE_CLOUD_PROJECT"])
    doc = db.collection("sessions").document(SESSION_TOKEN).get().to_dict()
    print(f"\n=== FINAL FIRESTORE STATE sessions/{SESSION_TOKEN} ===")
    print("status:", doc.get("status"))
    print("analysisResult:", str(doc.get("analysisResult"))[:300])


if __name__ == "__main__":
    asyncio.run(main())
