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
