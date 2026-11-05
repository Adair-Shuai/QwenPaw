# -*- coding: utf-8 -*-
"""Process settings for the host-managed, release-pinned OfficeCLI engine."""

import os
from collections.abc import Mapping


def officecli_environment(
    environment: Mapping[str, str] | None = None,
    **overrides: str,
) -> dict[str, str]:
    """Preserve caller settings while keeping engine updates host-managed."""
    merged = dict(
        os.environ if environment is None else environment,
        **overrides,
    )
    result = {
        key: value
        for key, value in merged.items()
        if key.upper() != "OFFICECLI_SKIP_UPDATE"
    }
    result["OFFICECLI_SKIP_UPDATE"] = "1"
    return result
