"""Dictionary attack demonstration (educational).

Given a target MD5 or SHA256 hex digest and a local wordlist file, iterate
through candidate passwords, hash each, and compare. Reports attempts and
elapsed time. Strictly for learning on hashes you generated yourself.
"""

from __future__ import annotations

import hashlib
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

SUPPORTED = {"md5", "sha256"}


@dataclass
class CrackResult:
    found: bool
    password: Optional[str]
    attempts: int
    elapsed_seconds: float
    algo: str


class DictionaryCracker:
    """Compare candidate hashes from a wordlist against a target hash."""

    def crack(self, target_hash: str, algo: str, wordlist_path: str) -> CrackResult:
        algo = algo.lower()
        if algo not in SUPPORTED:
            raise ValueError("Only md5 and sha256 are supported for this demo.")

        target = target_hash.strip().lower()
        path = Path(wordlist_path)
        if not path.exists():
            raise FileNotFoundError(f"Wordlist not found: {wordlist_path}")

        attempts = 0
        start = time.perf_counter()
        with path.open("r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                candidate = line.rstrip("\r\n")
                if not candidate:
                    continue
                attempts += 1
                h = hashlib.new(algo)
                h.update(candidate.encode("utf-8"))
                if h.hexdigest() == target:
                    elapsed = time.perf_counter() - start
                    return CrackResult(True, candidate, attempts, elapsed, algo)

        elapsed = time.perf_counter() - start
        return CrackResult(False, None, attempts, elapsed, algo)
