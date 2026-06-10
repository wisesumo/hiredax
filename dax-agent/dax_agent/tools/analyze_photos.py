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
