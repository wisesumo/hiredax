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
