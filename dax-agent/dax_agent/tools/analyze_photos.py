"""
ADK function tool: analyze_photos
Pulls the session's uploaded photo URLs from Firestore, calls Gemini 2.5 Flash
Vision via Vertex AI, and returns a structured AnalysisResult.
"""
import json
import os

import requests
import vertexai
from google.cloud import firestore
from vertexai.generative_models import GenerationConfig, GenerativeModel, Part

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
- confidence: float 0.0-1.0, how confident you are in the item
  identification and volume estimates

Return ONLY valid JSON matching this structure:
{
  "items": [{"name": str, "volume": float, "quantity": int}],
  "totalVolume": float,
  "estimatedPrice": float,
  "surcharges": {"heavy_items": float, "stairs": float, "interior": float},
  "confidence": float
}
"""

# Demo-safety net: if Vertex AI or Firestore is unreachable mid-demo, the call
# still produces a reviewable estimate (clearly flagged as a fallback).
FALLBACK_RESULT = {
    "items": [
        {"name": "couch", "volume": 3.0, "quantity": 1},
        {"name": "mattress", "volume": 1.5, "quantity": 1},
    ],
    "totalVolume": 4.5,
    "volume_yd3": 4.5,
    "estimatedPrice": 487.5,
    "surcharges": {"heavy_items": 0.0, "stairs": 0.0, "interior": 50.0},
    "confidence": 0.5,
    "fallback": True,
}


def _photo_part(url: str) -> Part:
    if url.startswith("gs://"):
        return Part.from_uri(url, mime_type="image/jpeg")
    # Firebase Storage download URLs are https — Vertex can't fetch those
    # itself, so pull the bytes and inline them. Some hosts (e.g. Wikimedia)
    # reject the default python-requests User-Agent.
    resp = requests.get(
        url, timeout=10, headers={"User-Agent": "HireDax-Dax-Agent/0.1"}
    )
    resp.raise_for_status()
    mime = resp.headers.get("Content-Type", "image/jpeg").split(";")[0]
    if not mime.startswith("image/"):
        mime = "image/jpeg"
    return Part.from_data(resp.content, mime_type=mime)


def analyze_photos(session_token: str) -> dict:
    """
    Analyze the customer's uploaded photos and return a pricing estimate.

    Args:
        session_token: The session whose uploaded photos should be analyzed.

    Returns:
        AnalysisResult dict: items[], totalVolume (cubic yards),
        estimatedPrice, surcharges, confidence.
    """
    try:
        db = firestore.Client(project=os.environ["GOOGLE_CLOUD_PROJECT"])
        snapshot = db.collection("sessions").document(session_token).get()
        if not snapshot.exists:
            return {**FALLBACK_RESULT, "session_token": session_token,
                    "error": f"session {session_token} not found"}
        doc = snapshot.to_dict()
        # Seed script and portal write "photoUrls"; SSD interface says "photos"
        photo_urls = doc.get("photoUrls") or doc.get("photos") or []
        if not photo_urls:
            return {**FALLBACK_RESULT, "session_token": session_token,
                    "error": "no photos uploaded yet"}

        vertexai.init(
            project=os.environ["GOOGLE_CLOUD_PROJECT"],
            location=os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1"),
        )
        model = GenerativeModel("gemini-2.5-flash")

        parts = [_photo_part(url) for url in photo_urls]
        parts.append(Part.from_text(VISION_PROMPT))

        response = model.generate_content(
            parts,
            generation_config=GenerationConfig(
                response_mime_type="application/json"
            ),
        )
        result = json.loads(response.text.strip())
        result["volume_yd3"] = result.get("totalVolume", 0.0)
        result["session_token"] = session_token
        result["fallback"] = False
        return result
    except Exception as exc:  # demo safety: never crash the live call
        return {**FALLBACK_RESULT, "session_token": session_token,
                "error": str(exc)}
