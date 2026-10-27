# -*- coding: utf-8 -*-
"""Own the workflow loop until cancelled runs and their cleanup finish."""

from __future__ import annotations

import asyncio
import logging
import math
import time
from concurrent.futures import Future

logger = logging.getLogger(__name__)


def run_background_loop(loop: asyncio.AbstractEventLoop) -> None:
    """Close the dedicated loop on its own thread after it has stopped."""
    asyncio.set_event_loop(loop)
    try:
        loop.run_forever()
    finally:
        loop.close()


class WorkflowLifetimeMixin:
    """Synchronous test/CLI cleanup and nonblocking hosted teardown."""

    _closing: bool
    _shutdown_future: Future[None] | None

    @property
    def closed(self) -> bool:
        return self._loop.is_closed() and not self._loop_thread.is_alive()

    def _assert_accepting_runs(self) -> None:
        if self._closing:
            raise RuntimeError("Workflow service is shutting down")

    @staticmethod
    def _close_deadline(timeout: float) -> float:
        if (
            isinstance(timeout, bool)
            or not math.isfinite(timeout)
            or timeout <= 0
        ):
            raise ValueError("shutdown timeout must be positive and finite")
        return time.monotonic() + timeout

    def _request_close(self) -> Future[None]:
        with self._lifecycle_lock:
            if self._shutdown_future is not None:
                previous = self._shutdown_future
                if not previous.done() or (
                    not previous.cancelled() and previous.exception() is None
                ):
                    return previous
                # A failed teardown keeps ownership and may be retried after
                # its external failure (for example a busy store) is resolved.
                self._shutdown_future = None
            if self.closed:
                completed: Future[None] = Future()
                completed.set_result(None)
                self._shutdown_future = completed
                return completed
            self._closing = True
            self._shutdown_future = asyncio.run_coroutine_threadsafe(
                self._shutdown_runs(),
                self._loop,
            )
            self._shutdown_future.add_done_callback(self._stop_after_shutdown)
            return self._shutdown_future

    def _stop_after_shutdown(self, future: Future[None]) -> None:
        try:
            future.result()
        except BaseException:
            # Retain the loop and ownership on failed cleanup. A caller must
            # observe the failure rather than publish a false "closed" state.
            logger.exception("FlowForge shutdown did not complete")
        else:
            self._loop.call_soon_threadsafe(self._loop.stop)

    async def _shutdown_runs(self) -> None:
        if asyncio.get_running_loop() is not self._loop:
            raise RuntimeError("Workflow cleanup must run on its owned loop")
        # Submitted callbacks precede shutdown on this dedicated loop. Let
        # queued run coroutines acquire their task references before snapshot.
        await asyncio.sleep(0)
        with self._lifecycle_lock:
            handles = list(self._runs.values())
            for handle in handles:
                # Paused runs have finished their executor and own no live
                # work. Keep their checkpoint resumable across reload/exit.
                if not handle.is_done:
                    self.cancel_run(handle.run_id)
            tasks = {
                handle.task for handle in handles if handle.task is not None
            }
            for handle in handles:
                # Executing runs already own cooperative abort signals. Only
                # preparation (before the executor starts) needs task cancel.
                if not handle.execution_started and handle.task is not None:
                    if not handle.task.done() and not handle.task.cancelling():
                        handle.task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        # Never cancel a provider's shielded cleanup a second time. Detached
        # cleanup must finish before the loop can release ownership.
        current = asyncio.current_task()
        while pending := {
            task for task in asyncio.all_tasks() if task is not current
        }:
            await asyncio.gather(*pending, return_exceptions=True)
        await self._loop.shutdown_asyncgens()
        await self._loop.shutdown_default_executor()
        with self._lifecycle_lock:
            self._runs.clear()

    def close(self, timeout: float = 3.0) -> None:
        """Drain owned work and join the loop; retry safely after a timeout."""
        deadline = self._close_deadline(timeout)
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            pass
        else:
            raise RuntimeError("Use await service.aclose() from async code")
        future = self._request_close()
        future.result(timeout=max(0.0, deadline - time.monotonic()))
        self._loop_thread.join(timeout=max(0.0, deadline - time.monotonic()))
        if not self.closed:
            raise TimeoutError("FlowForge loop has not finished shutdown")

    async def aclose(self, timeout: float = 3.0) -> None:
        """Keep the host loop available while workflow callbacks unwind."""
        deadline = self._close_deadline(timeout)
        if asyncio.get_running_loop() is self._loop:
            raise RuntimeError("Close the workflow service from its host loop")
        future = self._request_close()
        waiter = asyncio.wrap_future(future)
        # A timed-out caller leaves cleanup running. Observe any later error
        # without cancelling the cleanup future or losing it for a retry.
        waiter.add_done_callback(
            lambda done: done.exception() if not done.cancelled() else None,
        )
        await asyncio.wait_for(
            asyncio.shield(waiter),
            timeout=max(0.0, deadline - time.monotonic()),
        )
        await asyncio.to_thread(
            self._loop_thread.join,
            max(0.0, deadline - time.monotonic()),
        )
        if not self.closed:
            raise TimeoutError("FlowForge loop has not finished shutdown")
