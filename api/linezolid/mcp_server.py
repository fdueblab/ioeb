"""利奈唑胺剂量 MCP 服务 — SSE 传输（与 IoEB 自动封装规范一致）。"""

from __future__ import annotations

import argparse
import json
import os
from typing import Any

import uvicorn
from mcp.server import Server
from mcp.server.fastmcp import FastMCP
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import Response
from starlette.routing import Mount, Route

from api.calculator import _calculate_linezolid_dose_impl

mcp = FastMCP("linezolid-dose")


@mcp.tool()
async def calculate_linezolid_dose(
    sex: int,
    age: int,
    height: int,
    weight: int,
    scr: float,
    tb: float,
    auc_range: list[float] | None = None,
) -> str:
    """计算利奈唑胺推荐剂量。sex: 性别(1=男,0=女)。age: 年龄(岁)。height: 身高(cm)。weight: 体重(kg)。
    scr: 血清肌酐(μmol/L)。tb: 总胆红素(μmol/L)。auc_range: 目标AUC24h范围，默认[160,240]。
    返回 JSON 字符串，包含推荐剂量与药代参数。"""
    if auc_range is None:
        auc_range = [160, 240]
    try:
        result: Any = _calculate_linezolid_dose_impl(
            sex, age, height, weight, scr, tb, auc_range
        )
        return json.dumps(result, ensure_ascii=False)
    except Exception as exc:
        return json.dumps({"error": str(exc)}, ensure_ascii=False)


def create_starlette_app(mcp_server: Server, *, debug: bool = False) -> Starlette:
    sse = SseServerTransport("/messages/")

    async def handle_sse(request: Request) -> Response:
        async with sse.connect_sse(
            request.scope,
            request.receive,
            request._send,  # noqa: SLF001
        ) as (read_stream, write_stream):
            await mcp_server.run(
                read_stream,
                write_stream,
                mcp_server.create_initialization_options(),
            )
        return Response()

    return Starlette(
        debug=debug,
        routes=[
            Route("/sse", endpoint=handle_sse),
            Mount("/messages/", app=sse.handle_post_message),
        ],
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="利奈唑胺 MCP 服务（SSE）")
    parser.add_argument("--host", default=os.environ.get("HOST", "0.0.0.0"))
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PORT", "8000")),
    )
    args = parser.parse_args()

    starlette_app = create_starlette_app(mcp._mcp_server)
    host_label = "localhost" if args.host == "0.0.0.0" else args.host
    print(f"linezolid MCP SSE: http://{host_label}:{args.port}/sse")
    uvicorn.run(starlette_app, host=args.host, port=args.port)
