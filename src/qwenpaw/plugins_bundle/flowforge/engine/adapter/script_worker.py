"""JSON worker for trusted local snippets; not a security sandbox."""
from __future__ import annotations

import builtins
import contextlib
import importlib
import io
import json
import sys
import types

_ALLOWED = {"math", "json", "re", "statistics", "datetime", "itertools", "collections", "functools", "operator", "string", "random", "decimal", "fractions"}
_NAMES = "abs all any ascii bin bool bytes bytearray callable chr dict divmod enumerate filter float format frozenset hex int isinstance issubclass iter len list map max min next oct ord pow range repr reversed round set sorted str sum tuple type zip Exception ValueError TypeError KeyError IndexError AttributeError RuntimeError StopIteration ZeroDivisionError ImportError NotImplementedError ArithmeticError LookupError OverflowError".split()


class CappedOutput(io.StringIO):
    def __init__(self, limit: int):
        super().__init__()
        self.limit = limit
        self.truncated = False

    def write(self, value: str) -> int:
        remaining = max(0, self.limit - self.tell())
        super().write(value[:remaining])
        self.truncated = self.truncated or len(value) > remaining
        return len(value)


def main() -> None:
    payload = json.loads(sys.stdin.read(4 * 1024 * 1024))
    # Defence against accidental runaway snippets on POSIX; hostile code still
    # requires a dedicated OS/container sandbox outside the application.
    try:
        import resource
        resource.setrlimit(resource.RLIMIT_CPU, (35, 35))
        resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024, 256 * 1024 * 1024))
    except (ImportError, OSError, ValueError):
        pass
    unknown = set(payload.get("allow_modules") or []) - _ALLOWED
    if unknown:
        raise ValueError("module is not permitted: " + ", ".join(sorted(unknown)))
    stream = CappedOutput(int(payload.get("max_stdout", 65536)))
    namespace = {name: importlib.import_module(name) for name in _ALLOWED}
    namespace.update(payload.get("inputs") or {})
    namespace["__builtins__"] = {name: getattr(builtins, name) for name in _NAMES}
    namespace["print"] = lambda *args, **kwargs: print(*args, file=stream, **{key: value for key, value in kwargs.items() if key != "file"})
    namespace["result"] = None
    original = set(namespace)
    with contextlib.redirect_stdout(stream), contextlib.redirect_stderr(stream):
        exec(payload["source"], namespace, namespace)
    result = {
        "result": namespace.get("result"),
        "locals": {key: value for key, value in namespace.items() if key == "result" or (key not in original and not key.startswith("_") and not callable(value) and not isinstance(value, types.ModuleType))},
        "stdout": stream.getvalue(),
        "truncated_stdout": stream.truncated,
    }
    encoded = json.dumps(result, ensure_ascii=False, allow_nan=False)
    if len(encoded) > 2 * 1024 * 1024:
        raise ValueError("script output exceeds 2 MiB")
    print(encoded)


if __name__ == "__main__":
    try:
        main()
    except BaseException as exc:
        print(json.dumps({"error": f"{type(exc).__name__}: {exc}"}))
        sys.exit(1)
