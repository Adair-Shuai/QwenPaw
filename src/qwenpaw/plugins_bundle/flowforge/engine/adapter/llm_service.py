# -*- coding: utf-8 -*-
"""Adapter: LLM service bridging QwenPaw's ``ProviderManager``.

LeAgent's workflow nodes call \
``llm_service.complete(messages=..., model=..., temperature=..., \
max_tokens=...)``
and expect a response object with ``.content`` (str).

QwenPaw uses agentscope 2.0's ``ChatModelBase.__call__`` which \
takes
``Msg`` objects and returns a ``ChatResponse`` or an async \
response stream.
The final ``is_last=True`` response contains the complete text; \
earlier
responses are deltas and must not be appended to that final \
response.
This adapter:

1. Accepts ``ChatMessage`` objects (from :mod:`.chat_message`).
2. Converts them to agentscope ``Msg``.
3. Resolves the model via ``ProviderManager`` (active model or \
override).
4. Calls the model and extracts the text content from the \
response.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
from dataclasses import asdict, dataclass, is_dataclass
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

    def __init__(
        self,
        provider_manager: Any | None = None,
        *,
        agent_id: str | None = None,
    ) -> None:
        self._pm = provider_manager
        self.agent_id = agent_id

    def for_agent(self, agent_id: str) -> LLMService:
        """Bind a request without changing the shared adapter or global \
model."""
        return LLMService(self._pm, agent_id=agent_id)

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

        if not (provider and model):
            # Read on every completion so changing an agent's model takes
            # effect without a plugin restart. A missing/broken agent must
            # fail rather than silently borrow another agent's configuration.
            active = None
            if self.agent_id is not None:
                from qwenpaw.config.config import load_agent_config

                config = load_agent_config(self.agent_id)
                if getattr(config, "enabled", True) is False:
                    raise RuntimeError(f"Agent '{self.agent_id}' is disabled")
                active = config.active_model
            # An unset agent model inherits the host default, as chat does.
            active = active or pm.get_active_model()
            if active is None or not active.provider_id or not active.model:
                raise RuntimeError("No active model configured")
            if provider and provider != active.provider_id:
                raise ValueError("A provider override requires a model")
            provider = provider or active.provider_id
            model = model or active.model

        prov = pm.get_provider(provider)
        if prov is None:
            raise RuntimeError(f"Provider '{provider}' not found")
        if getattr(prov, "enabled", True) is False:
            raise RuntimeError(f"Provider '{provider}' is disabled")

        chat_model = prov.get_chat_model_instance(model)
        return chat_model, provider, model

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
        from agentscope.message import Msg

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

        # Invoke exactly once. A TypeError raised *inside* a provider is a
        # failure, not evidence that it should be called a second time.
        response = chat_model(msgs, **gen_config)
        if inspect.isawaitable(response):
            response = await response
        _check_cancellation()
        response = await _complete_response(response)
        content = _extract_text(response)

        usage = _field(response, "usage")
        if is_dataclass(usage) and not isinstance(usage, type):
            usage = asdict(usage)
        elif hasattr(usage, "model_dump"):
            usage = usage.model_dump()

        return LLMResponse(
            content=content,
            model=resolved_model,
            provider=resolved_provider,
            usage=usage if isinstance(usage, dict) else None,
            raw=response,
        )


def _field(value: Any, name: str, default: Any = None) -> Any:
    return (
        value.get(name, default)
        if isinstance(value, dict)
        else getattr(value, name, default)
    )


def _check_cancellation() -> None:
    # AgentScope converts a cancelled API call/stream into an interrupted
    # response. Keep cancellation observable to wait_for and the run engine.
    task = asyncio.current_task()
    if task is not None and task.cancelling():
        raise asyncio.CancelledError()


def _check_response(response: Any) -> None:
    _check_cancellation()
    reason = _field(response, "finished_reason")
    reason = getattr(reason, "value", reason)
    status = _field(response, "status")
    status = getattr(status, "value", status)
    if reason in {"interrupted", "cancelled", "canceled"} or status in {
        "cancelled",
        "canceled",
    }:
        raise asyncio.CancelledError("Model completion was interrupted")
    error = _field(response, "error")
    if error or reason in {"error", "failed"} or status in {"error", "failed"}:
        raise RuntimeError("Model completion failed")


async def _complete_response(response: Any) -> Any:
    if not hasattr(response, "__aiter__"):
        _check_response(response)
        if _field(response, "is_last") is False:
            raise RuntimeError("Model returned an incomplete response")
        return response

    terminal = None
    try:
        async for chunk in response:
            _check_response(chunk)
            if _field(chunk, "is_last") is True:
                # The current host protocol guarantees complete content here.
                # Do not concatenate either incremental or cumulative previews.
                terminal = chunk
                # Exhaust the SDK wrapper so its underlying transport reaches
                # its cleanup block, including after an explicit final chunk.
    finally:
        close = getattr(response, "aclose", None)
        if close is not None:
            await close()
    if terminal is None:
        raise RuntimeError("Model stream ended without a complete response")
    return terminal


def _extract_text(response: Any) -> str:
    """Extract text from an agentscope ``ChatResponse`` or similar."""
    if isinstance(response, str):
        return response
    content = _field(response, "content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(
            text
            for block in content
            if _field(block, "type", "text") == "text"
            and isinstance(text := _field(block, "text"), str)
        )
    text = _field(response, "text")
    if isinstance(text, str):
        return text
    raise RuntimeError("Model returned an unsupported completion response")


__all__ = ["LLMResponse", "LLMService"]
