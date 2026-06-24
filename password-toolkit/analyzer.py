"""Password strength analyzer.

Computes entropy = length * log2(charset_size) and reports a strength tier
along with concrete recommendations to improve weak passwords.
"""

from __future__ import annotations

import math
import string
from dataclasses import dataclass, field
from typing import List


@dataclass
class AnalysisResult:
    password_length: int
    has_lower: bool
    has_upper: bool
    has_digit: bool
    has_symbol: bool
    charset_size: int
    entropy: float
    strength: str
    recommendations: List[str] = field(default_factory=list)


class PasswordAnalyzer:
    """Analyze password strength using character variety and entropy."""

    SYMBOLS = string.punctuation

    def analyze(self, password: str) -> AnalysisResult:
        if password is None:
            raise ValueError("password must not be None")

        has_lower = any(ch.islower() for ch in password)
        has_upper = any(ch.isupper() for ch in password)
        has_digit = any(ch.isdigit() for ch in password)
        has_symbol = any(ch in self.SYMBOLS for ch in password)

        charset_size = 0
        if has_lower:
            charset_size += 26
        if has_upper:
            charset_size += 26
        if has_digit:
            charset_size += 10
        if has_symbol:
            charset_size += len(self.SYMBOLS)

        length = len(password)
        entropy = length * math.log2(charset_size) if charset_size > 0 else 0.0
        strength = self._rate(entropy)

        recs: List[str] = []
        if length < 12:
            recs.append("Use at least 12 characters (16+ recommended).")
        if not has_upper:
            recs.append("Add uppercase letters (A-Z).")
        if not has_lower:
            recs.append("Add lowercase letters (a-z).")
        if not has_digit:
            recs.append("Add digits (0-9).")
        if not has_symbol:
            recs.append("Add special characters (!@#$ ...).")
        if entropy < 60:
            recs.append("Prefer a long passphrase of unrelated words.")
        if not recs:
            recs.append("Looks solid. Still: never reuse passwords; use a manager.")

        return AnalysisResult(
            password_length=length,
            has_lower=has_lower,
            has_upper=has_upper,
            has_digit=has_digit,
            has_symbol=has_symbol,
            charset_size=charset_size,
            entropy=round(entropy, 2),
            strength=strength,
            recommendations=recs,
        )

    @staticmethod
    def _rate(entropy: float) -> str:
        if entropy < 28:
            return "Weak"
        if entropy < 60:
            return "Medium"
        if entropy < 100:
            return "Strong"
        return "Very Strong"
