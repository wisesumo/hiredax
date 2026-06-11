"""One-off probe: list tools on the Google managed Firestore MCP server."""
import json

import google.auth
import google.auth.transport.requests
import requests

URL = "https://firestore.googleapis.com/mcp"

creds, project = google.auth.default(
    scopes=["https://www.googleapis.com/auth/datastore"]
)
creds.refresh(google.auth.transport.requests.Request())
headers = {
    "Authorization": f"Bearer {creds.token}",
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
}

resp = requests.post(
    URL,
    headers=headers,
    json={"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}},
    timeout=15,
)
print("HTTP", resp.status_code, "project:", project)
data = resp.json()
for tool in data.get("result", {}).get("tools", []):
    desc = (tool.get("description") or "").replace("\n", " ")[:100]
    print(f"- {tool['name']}: {desc}")
if "error" in data:
    print("ERROR:", json.dumps(data["error"])[:500])
