# -*- coding: utf-8 -*-
"""Adapter: LLM service bridging QwenPaw's ``ProviderManager``.

LeAgent's workflow nodes call ``llm_service.complete(messages=..., model=..., temperature=..., max_tokens=...)``
and expect a response object with ``.content`` (str).

QwenPaw uses agentscope 2.0's ``ChatModelBase.__call__`` which takes
``Msg`` objects and returns a ``ChatResponse``.  This adapter:

1. Accepts ``ChatMessage`` objects (from :mod:`.chat_message`).
2. Converts them to agentscope ``Msg``.
3. Resolves the model via ``ProviderManager`` (active model or override).
4. Calls the model and extracts the text content from the response.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from .chat_message import ChatMessage

logger = logging.getLogger(__name__)


@dataclass
class LLMResponse:
    """Normalised LLM completion response (mirrors LeAgent's interface)."""

    content: str = ""
    model: str = ""
    provider: str = ""
    usage: dict[str, Any] | None = None
    raw: Any = None


class LLMService:
    """LLM service adapter wrapping QwenPaw's ``ProviderManager``.

    Usage::

        svc = LLMService()
        response = await svc.complete(
            messages=[ChatMessage.user("Hello")],
            model="deepseek/deepseek-chat",  # optional override
            temperature=0.1,
            max_tokens=4096,
        )
        print(response.content)
    """

    def __init__(self, provider_manager: Any | None = None) -> None:
        self._pm = provider_manager

    def _get_provider_manager(self) -> Any:
        """Lazily resolve the ProviderManager singleton."""
        if self._pm is not None:
            return self._pm
        try:
            from qwenpaw.providers.provider_manager import ProviderManager

            self._pm = ProviderManager.get_instance()
        except Exception:  # noqa: BLE001
            logger.warning("Failed to resolve ProviderManager", exc_info=True)
        return self._pm

    def _resolve_model(
        self,
        provider: str | None,
        model: str | None,
    ) -> tuple[Any, str, str]:
        """Return ``(chat_model_instance, provider_id, model_id)``."""
        pm = self._get_provider_manager()
        if pm is None:
            raise RuntimeError("No ProviderManager available")

        if provider and model:
            prov = pm.get_provider(provider)
            if prov is None:
                raise RuntimeError(f"Provider '{provider}' not found")
            chat_model = prov.get_chat_model_instance(model)
            return chat_model, provider, model

        # Fallback: use the active model
        active = pm.get_active_model()
        if active is None or not active.provider_id or not active.model:
            raise RuntimeError("No active model configured")

        prov = pm.get_provider(active.provider_id)
        if prov is None:
            raise RuntimeError(f"Active provider '{active.provider_id}' not found")

        chat_model = prov.get_chat_model_instance(active.model)
        return chat_model, active.provider_id, active.model

    async def complete(
        self,
        *,
        messages: list[ChatMessage],
        model: str | None = None,
        provider: str | None = None,
        temperature: float = 0.1,
        max_tokens: int = 4096,
        **kwargs: Any,
    ) -> LLMResponse:
        """Complete a chat prompt and return a normalised :class:`LLMResponse`.

        Args:
            messages: List of :class:`ChatMessage` objects.
            model: Optional model override (model id only).
            provider: Optional provider id override.
            temperature: Sampling temperature.
            max_tokens: Maximum tokens to generate.
        """
        from agentscope.message import Msg, TextBlock

        # Convert ChatMessage → Msg
        msgs: list[Msg] = []
        for m in messages:
            msgs.append(m.to_msg())

        # Resolve the chat model
        # Parse "provider/model" from the model string if present
        prov_override = provider
        model_override = model
        if model and "/" in model and not provider:
            parts = model.split("/", 1)
            prov_override = parts[0]
            model_override = parts[1]

        chat_model, resolved_provider, resolved_model = self._resolve_model(
            prov_override,
            model_override,
        )

        # Build generation config
        gen_config: dict[str, Any] = {}
        if temperature is not None:
            gen_config["temperature"] = temperature
        if max_tokens is not None:
            gen_config["max_tokens"] = max_tokens
        gen_config.update(kwargs)

        # Call the model
        try:
            response = await chat_model(msgs, **gen_config)
        except TypeError:
            # Some models are synchronous
            response = chat_model(msgs, **gen_config)

        # Extract text content
        content = _extract_text(response)

        return LLMResponse(
            content=content,
            model=resolved_model,
            provider=resolved_provider,
            raw=response,
        )


def _extract_text(response: Any) -> str:
    """Extract text from an agentscope ``ChatResponse`` or similar."""
    # ChatResponse has .text or .content
    if hasattr(response, "text") and isinstance(response.text, str):
        return response.text

    # Try .content (could be a list of blocks or a string)
    content = getattr(response, "content", None)
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []
        for block in content:
            text = getattr(block, "text", None)
            if isinstance(text, str) and text:
                parts.append(text)
        if parts:
            return "\n".join(parts)

    # Msg object
    if hasattr(response, "content"):
        c = response.content
        if isinstance(c, str):
            return c
        if isinstance(c, list):
            parts = []
            for block in c:
                text = getattr(block, "text", None)
                if isinstance(text, str) and text:
                    parts.append(text)
            if parts:
                return "\n".join(parts)

    # Last resort
    return str(response) if response is not None else ""


__all__ = ["LLMResponse", "LLMService"]
