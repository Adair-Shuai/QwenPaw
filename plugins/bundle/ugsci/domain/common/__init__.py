# -*- coding: utf-8 -*-
"""Shared domain primitives: errors, result envelopes, and serialization."""

from .errors import DomainError, DomainErrorCode
from .result import ArtifactRef, DomainResult

__all__ = [
    "ArtifactRef",
    "DomainError",
    "DomainErrorCode",
    "DomainResult",
]
