# -*- coding: utf-8 -*-
"""UGSci shared file/artifact conversion contracts.

This package owns format detection and conversion orchestration.  Concrete
readers remain providers, while Viewer runtimes consume the resulting
artifact manifest without owning the source-file lifecycle.
"""

from .conversion import (
    ArtifactConversionRequest,
    ConversionHandler,
    FileConversionRegistry,
    FormatMatch,
    find_companion,
)

__all__ = [
    "ArtifactConversionRequest",
    "ConversionHandler",
    "FileConversionRegistry",
    "FormatMatch",
    "find_companion",
]
