"""Hash generator for MD5, SHA1, SHA256, SHA512.

Note: MD5 and SHA1 are shown for educational comparison only.
They are NOT secure for password storage. Use bcrypt / Argon2 instead.
"""

from __future__ import annotations

import hashlib
from typing import Dict

SUPPORTED_ALGOS = ("md5", "sha1", "sha256", "sha512")


class HashGenerator:
    """Generate hex digests across common algorithms."""

    def generate(self, text: str, algo: str) -> str:
        algo = algo.lower()
        if algo not in SUPPORTED_ALGOS:
            raise ValueError(f"Unsupported algorithm: {algo}")
        h = hashlib.new(algo)
        h.update(text.encode("utf-8"))
        return h.hexdigest()

    def generate_all(self, text: str) -> Dict[str, str]:
        return {a: self.generate(text, a) for a in SUPPORTED_ALGOS}
