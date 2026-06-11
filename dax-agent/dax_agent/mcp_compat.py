"""
Compatibility shim for the Google Managed Firestore MCP server.

The server declares `nullValue: {"enum": ["NULL_VALUE"]}` in its output
schema but actually returns JSON `null` for null document fields (e.g. a
session's approvedPrice before approval). The official mcp client validates
structured tool results against the declared schema and raises, killing the
tool call. Until Google fixes the server, downgrade that validation failure
to a pass-through — the payload itself is fine.
"""
import mcp.client.session as _mcp_client_session

_original_validate = _mcp_client_session.ClientSession._validate_tool_result


async def _lenient_validate_tool_result(self, name, result):
    try:
        await _original_validate(self, name, result)
    except RuntimeError:
        pass


def apply() -> None:
    _mcp_client_session.ClientSession._validate_tool_result = (
        _lenient_validate_tool_result
    )
