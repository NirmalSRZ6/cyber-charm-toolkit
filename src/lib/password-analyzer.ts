// Pure client-side password analysis. No network calls. Educational use.

export type Strength = "Very Weak" | "Weak" | "Medium" | "Strong" | "Very Strong";

export interface AnalysisResult {
  password: string;
  length: number;
  charsetSize: number;
  entropy: number; // bits
  strength: Strength;
  score: number; // 0-100
  checks: {
    lowercase: boolean;
    uppercase: boolean;
    digits: boolean;
    symbols: boolean;
    longEnough: boolean;
    veryLong: boolean;
    noCommon: boolean;
    noSequential: boolean;
    noRepeats: boolean;
  };
  recommendations: string[];
  estimatedCrackTime: string;
}

const COMMON = new Set([
  "password", "123456", "12345678", "qwerty", "abc123", "111111",
  "password1", "iloveyou", "admin", "welcome", "letmein", "monkey",
  "dragon", "sunshine", "princess", "qwerty123", "passw0rd", "p@ssword",
]);

function charsetSize(pw: string): number {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) size += 32;
  return size || 1;
}

function hasSequential(pw: string): boolean {
  const s = pw.toLowerCase();
  for (let i = 0; i < s.length - 2; i++) {
    const a = s.charCodeAt(i), b = s.charCodeAt(i + 1), c = s.charCodeAt(i + 2);
    if (b - a === 1 && c - b === 1) return true;
    if (a - b === 1 && b - c === 1) return true;
  }
  return false;
}

function hasRepeats(pw: string): boolean {
  return /(.)\1{2,}/.test(pw);
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "centuries";
  if (seconds < 1) return "instantly";
  const units: [number, string][] = [
    [60, "seconds"],
    [60, "minutes"],
    [24, "hours"],
    [365, "days"],
    [100, "years"],
    [Infinity, "centuries"],
  ];
  let value = seconds;
  let label = "seconds";
  for (const [factor, name] of units) {
    if (value < factor) { label = name; break; }
    value /= factor;
    label = name;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${label}`;
}

export function analyzePassword(pw: string): AnalysisResult {
  const length = pw.length;
  const size = charsetSize(pw);
  const entropy = length === 0 ? 0 : length * Math.log2(size);

  const checks = {
    lowercase: /[a-z]/.test(pw),
    uppercase: /[A-Z]/.test(pw),
    digits: /[0-9]/.test(pw),
    symbols: /[^a-zA-Z0-9]/.test(pw),
    longEnough: length >= 12,
    veryLong: length >= 16,
    noCommon: !COMMON.has(pw.toLowerCase()),
    noSequential: !hasSequential(pw),
    noRepeats: !hasRepeats(pw),
  };

  let strength: Strength;
  if (entropy < 28) strength = "Very Weak";
  else if (entropy < 40) strength = "Weak";
  else if (entropy < 60) strength = "Medium";
  else if (entropy < 90) strength = "Strong";
  else strength = "Very Strong";

  if (!checks.noCommon) strength = "Very Weak";

  const score = Math.min(100, Math.round((entropy / 100) * 100));

  const recommendations: string[] = [];
  if (!checks.longEnough) recommendations.push("Use at least 12 characters (16+ recommended).");
  if (!checks.uppercase) recommendations.push("Add uppercase letters.");
  if (!checks.lowercase) recommendations.push("Add lowercase letters.");
  if (!checks.digits) recommendations.push("Add digits (0-9).");
  if (!checks.symbols) recommendations.push("Add symbols (!@#$…).");
  if (!checks.noCommon) recommendations.push("Avoid common passwords from breach lists.");
  if (!checks.noSequential) recommendations.push("Avoid sequential characters like 'abc' or '123'.");
  if (!checks.noRepeats) recommendations.push("Avoid repeated characters like 'aaa'.");
  if (recommendations.length === 0) recommendations.push("Excellent — consider a passphrase + manager + 2FA.");

  // Assume 10 billion guesses/sec (modern GPU on fast hash)
  const guesses = Math.pow(2, entropy) / 2;
  const seconds = guesses / 1e10;

  return {
    password: pw,
    length,
    charsetSize: size,
    entropy,
    strength,
    score,
    checks,
    recommendations,
    estimatedCrackTime: formatTime(seconds),
  };
}

// Cryptographically strong password generator
export function generatePassword(length = 20, opts = { upper: true, lower: true, digits: true, symbols: true }): string {
  const sets: string[] = [];
  if (opts.lower) sets.push("abcdefghijklmnopqrstuvwxyz");
  if (opts.upper) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (opts.digits) sets.push("0123456789");
  if (opts.symbols) sets.push("!@#$%^&*()-_=+[]{};:,.<>?/");
  if (sets.length === 0) sets.push("abcdefghijklmnopqrstuvwxyz");
  const pool = sets.join("");
  const out: string[] = [];
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  // Guarantee at least one from each chosen set
  for (let i = 0; i < sets.length && i < length; i++) {
    const r = new Uint32Array(1); crypto.getRandomValues(r);
    out.push(sets[i][r[0] % sets[i].length]);
  }
  for (let i = out.length; i < length; i++) {
    out.push(pool[buf[i] % pool.length]);
  }
  // Shuffle
  for (let i = out.length - 1; i > 0; i--) {
    const r = new Uint32Array(1); crypto.getRandomValues(r);
    const j = r[0] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join("");
}
