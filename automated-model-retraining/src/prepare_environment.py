"""Apply a narrow Evidently type-annotation workaround for Python 3.11."""
from __future__ import annotations
import importlib.util
import re
from pathlib import Path


def main() -> None:
    spec = importlib.util.find_spec("evidently")
    if spec is None or spec.origin is None:
        raise RuntimeError("Evidently is not installed in this Python environment")
    package = Path(spec.origin).parent
    alias = re.compile(r"DataPointsAsType\[\s*[A-Za-z_][A-Za-z0-9_.]*\s*\]")
    patched = 0
    for path in package.rglob("*.py"):
        source = path.read_text(encoding="utf-8")
        updated, count = alias.subn("DataPointsAsType", source)
        if count:
            path.write_text(updated, encoding="utf-8")
            patched += count
    print(f"Evidently compatibility preparation complete ({patched} annotation(s) patched).")


if __name__ == "__main__":
    main()
