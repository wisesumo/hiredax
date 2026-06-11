"""Tier 1 verification: McpToolset → Google managed Firestore MCP server."""
import asyncio
import os

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


async def main():
    from dax_agent.agent import _SESSION_DOC_PREFIX, firestore_mcp

    tools = await firestore_mcp.get_tools()
    print("MCP tools loaded via McpToolset:", [t.name for t in tools])

    get_doc = next(t for t in tools if t.name == "get_document")
    session = await get_doc._mcp_session_manager.create_session()

    parent = _SESSION_DOC_PREFIX.rsplit("/", 1)[0]
    resp = await session.call_tool(
        "list_documents",
        {
            "parent": parent,
            "collectionId": "sessions",
            "pageSize": 3,
            "mask": {"fieldPaths": ["status", "token"]},
        },
    )
    print("list_documents over MCP (first 3 sessions):")
    for chunk in resp.content:
        print(getattr(chunk, "text", chunk)[:800])

    await firestore_mcp.close()


if __name__ == "__main__":
    asyncio.run(main())
