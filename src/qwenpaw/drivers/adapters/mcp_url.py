# -*- coding: utf-8 -*-
"""Keep MCP URL query credentials out of driver cards and API responses."""

from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from .mcp_binding import normalize_secret_key


def split_query_credentials(url: str) -> tuple[str, dict[str, str]]:
    parts = urlsplit(url)
    public = []
    secrets = {}
    for key, value in parse_qsl(parts.query, keep_blank_values=True):
        normalized = key.lower().replace("-", "_")
        if any(
            word in normalized
            for word in (
                "token",
                "apikey",
                "api_key",
                "secret",
                "password",
                "signature",
            )
        ):
            if key in secrets:
                raise ValueError("Duplicate MCP query credential parameter")
            secrets[key] = value
        else:
            public.append((key, value))
    return urlunsplit(parts._replace(query=urlencode(public))), secrets


def query_secret_key(name: str) -> str:
    return "url_query_" + normalize_secret_key(name)


def merge_query_credentials(url: str, values: dict[str, str]) -> str:
    if not values:
        return url
    parts = urlsplit(url)
    public = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if key not in values
    ]
    return urlunsplit(
        parts._replace(query=urlencode([*public, *values.items()])),
    )
