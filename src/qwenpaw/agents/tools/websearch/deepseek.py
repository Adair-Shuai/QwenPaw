# -*- coding: utf-8 -*-
"""DeepSeek's standalone web search API."""

from .base import SearchProvider, _post
from .credentials import read_optional_api_key


class DeepSeekSearchProvider(SearchProvider):
    name = "deepseek"

    async def search(
        self,
        query: str,
        max_results: int = 5,
    ) -> list[dict]:
        if len(query) > 128:
            raise ValueError("DeepSeek search queries must be at most 128 characters.")
        key = await read_optional_api_key("tool/web_search/deepseek")
        if not key:
            raise ValueError(
                "Configure a DeepSeek API key in the web_search tool settings."
            )
        data = await _post(
            "https://api.deepseek.com/v1/tools/search",
            headers={"Authorization": f"Bearer {key}"},
            payload={"query": query, "count": max_results},
        )
        return [
            {
                "title": item.get("title"),
                "url": item.get("url"),
                "content": item.get("summary") or item.get("snippet", ""),
            }
            for item in data["results"]
        ]
