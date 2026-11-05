# -*- coding: utf-8 -*-
"""Per-launch outcome consumed by the owning desktop supervisor."""

import json
import logging
import os
from pathlib import Path


def publish_startup_outcome(status: str) -> None:
    """Publish only a small state, never exception or configuration details."""
    path = os.environ.get("QWENPAW_STARTUP_RECEIPT")
    if not path:
        return
    destination = Path(path)
    temporary = destination.with_suffix(".tmp")
    try:
        temporary.write_text(json.dumps({"status": status}), encoding="utf-8")
        os.replace(temporary, destination)
    except OSError:
        logging.getLogger(__name__).warning(
            "Unable to publish desktop startup outcome",
            exc_info=True,
        )
