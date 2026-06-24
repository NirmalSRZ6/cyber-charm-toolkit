import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Shield, Hash, KeyRound, Bug, BookOpen, Copy, Check, RefreshCw,
  Eye, EyeOff, Terminal, Lock, AlertTriangle, Cpu,
} from "lucide-react";
import { analyzePassword, generatePassword, type AnalysisResult } from "@/lib/password-analyzer";
import { hashAll, hashOne, type HashAlgo } from "@/lib/hashing";
import { DEMO_WORDLIST } from "@/lib/wordlist";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Password Analyzer & Hash Security Toolkit" },
      { name: "description", content: "Analyze password strength, generate MD5/SHA hashes, and simulate dictionary attacks — entirely in your browser. Educational cybersecurity toolkit." },
      { property: "og:title", content: "Password Analyzer & Hash Security Toolkit" },
      { property: "og:description", content: "Educational cybersecurity playground: entropy scoring, hash generators, and a dictionary-attack simulator. Runs 100% locally." },
    ],
  }),
  component: HomePage,
});

const STRENGTH_COLORS: Record<string, string> = {
  "Very Weak": "bg-destructive/20 text-destructive border-destructive/40",
  "Weak": "bg-destructive/15 text-destructive border-destructive/30",
  "Medium": "bg-warning/15 text-warning border-warning/30",
  "Strong": "bg-primary/15 text-primary border-primary/30",
  "Very Strong": "bg-primary/25 text-primary border-primary/50",
};

const BANNER = String.raw`
 ____                                    _   _____           _ _    _ _
|  _ \ __ _ ___ ___ __      _____  _ __ | | |_   _|__   ___ | | | _(_) |_
| |_) / _\` / __/ __\ \ /\ / / _ \| '__|| |   | |/ _ \ / _ \| | |/ / | __|
|  __/ (_| \__ \__ \\ V  V / (_) | |   | |___| | (_) | (_) | |   <| | |_
|_|   \__,_|___/___/ \_/\_/ \___/|_|   |_____|_|\___/ \___/|_|_|\_\_|\__|
`;

function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 bg-background/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 border border-primary/40 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Password Analyzer <span className="text-primary">&amp;</span> Hash Toolkit
              </h1>
              <p className="text-xs text-muted-foreground font-mono">v1.0 • runs 100% in your browser • educational use only</p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary hidden sm:inline-flex">
            <Lock className="h-3 w-3 mr-1" /> local-only
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-xl border border-primary/30 bg-card/60 cyber-grid p-6 mb-8 relative overflow-hidden">
          <pre className="text-[10px] sm:text-xs leading-tight font-mono text-primary/90 overflow-x-auto">{BANNER}</pre>
          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
            <Feature icon={<Shield className="h-4 w-4" />} title="Strength scoring" desc="Entropy, character classes, breach checks" />
            <Feature icon={<Hash className="h-4 w-4" />} title="Hash generators" desc="MD5, SHA-1, SHA-256, SHA-512" />
            <Feature icon={<Bug className="h-4 w-4" />} title="Dictionary attack" desc="Simulate cracking against a demo wordlist" />
          </div>
        </section>

        <Tabs defaultValue="analyzer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="analyzer" className="gap-2"><Shield className="h-4 w-4" />Analyzer</TabsTrigger>
            <TabsTrigger value="generator" className="gap-2"><KeyRound className="h-4 w-4" />Generator</TabsTrigger>
            <TabsTrigger value="hash" className="gap-2"><Hash className="h-4 w-4" />Hashes</TabsTrigger>
            <TabsTrigger value="cracker" className="gap-2"><Bug className="h-4 w-4" />Cracker</TabsTrigger>
            <TabsTrigger value="learn" className="gap-2"><BookOpen className="h-4 w-4" />Learn</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="mt-6"><AnalyzerPanel /></TabsContent>
          <TabsContent value="generator" className="mt-6"><GeneratorPanel /></TabsContent>
          <TabsContent value="hash" className="mt-6"><HashPanel /></TabsContent>
          <TabsContent value="cracker" className="mt-6"><CrackerPanel /></TabsContent>
          <TabsContent value="learn" className="mt-6"><LearnPanel /></TabsContent>
        </Tabs>

        <footer className="mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground font-mono flex items-center gap-2">
          <Terminal className="h-3 w-3" />
          For educational cybersecurity learning only. No data leaves your browser. Do not use against systems you do not own.
        </footer>
      </main>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex items-center gap-2 text-primary text-sm font-medium">{icon}{title}</div>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}

// ---------------- Analyzer ----------------
function AnalyzerPanel() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const result: AnalysisResult = useMemo(() => analyzePassword(pw), [pw]);

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pw">Password to analyze</Label>
        <div className="relative">
          <Input
            id="pw"
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Type or paste a password…"
            className="font-mono pr-10"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={show ? "Hide" : "Show"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Nothing is sent anywhere. Calculation runs entirely in your browser.</p>
      </div>

      {pw.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <Badge className={`border ${STRENGTH_COLORS[result.strength]}`}>{result.strength}</Badge>
            <span className="text-sm font-mono text-muted-foreground">
              {result.entropy.toFixed(1)} bits of entropy
            </span>
          </div>
          <Progress value={result.score} className="h-2" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat label="Length" value={String(result.length)} />
            <Stat label="Charset" value={String(result.charsetSize)} />
            <Stat label="Crack time" value={result.estimatedCrackTime} mono />
            <Stat label="Score" value={`${result.score}/100`} />
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-2">
            <CheckItem ok={result.checks.longEnough} label="At least 12 characters" />
            <CheckItem ok={result.checks.veryLong} label="At least 16 characters" />
            <CheckItem ok={result.checks.uppercase} label="Uppercase letters" />
            <CheckItem ok={result.checks.lowercase} label="Lowercase letters" />
            <CheckItem ok={result.checks.digits} label="Digits" />
            <CheckItem ok={result.checks.symbols} label="Symbols" />
            <CheckItem ok={result.checks.noCommon} label="Not a common breached password" />
            <CheckItem ok={result.checks.noSequential} label="No sequential characters (abc/123)" />
            <CheckItem ok={result.checks.noRepeats} label="No 3+ repeated characters" />
          </div>

          <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
            <div className="flex items-center gap-2 text-accent font-medium text-sm mb-2">
              <AlertTriangle className="h-4 w-4" /> Recommendations
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </>
      )}
    </Card>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-base ${mono ? "font-mono" : "font-medium"}`}>{value}</div>
    </div>
  );
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${ok ? "text-primary" : "text-muted-foreground"}`}>
      <span className={`grid h-5 w-5 place-items-center rounded-full border ${ok ? "border-primary bg-primary/15" : "border-border bg-background/40"}`}>
        {ok ? <Check className="h-3 w-3" /> : <span className="block h-1 w-1 rounded-full bg-muted-foreground" />}
      </span>
      {label}
    </div>
  );
}

// ---------------- Generator ----------------
function GeneratorPanel() {
  const [length, setLength] = useState(20);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [pw, setPw] = useState("");
  const [copied, setCopied] = useState(false);

  const regen = () => setPw(generatePassword(length, { upper, lower, digits, symbols }));
  useEffect(() => { regen(); /* eslint-disable-next-line */ }, [length, upper, lower, digits, symbols]);

  const result = useMemo(() => analyzePassword(pw), [pw]);

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Generated password</Label>
          <span className="text-xs font-mono text-muted-foreground">{result.entropy.toFixed(1)} bits</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 rounded-md border border-primary/30 bg-background/40 px-3 py-3 font-mono text-sm break-all">
            {pw || "—"}
          </div>
          <Button variant="outline" size="icon" onClick={regen} aria-label="Regenerate"><RefreshCw className="h-4 w-4" /></Button>
          <Button
            variant="outline" size="icon"
            onClick={async () => { await navigator.clipboard.writeText(pw); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
            aria-label="Copy"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Length</Label>
            <span className="font-mono text-sm">{length}</span>
          </div>
          <Slider value={[length]} min={8} max={64} step={1} onValueChange={(v) => setLength(v[0])} />
        </div>

        <div className="space-y-3">
          <ToggleRow label="Uppercase (A-Z)" value={upper} onChange={setUpper} />
          <ToggleRow label="Lowercase (a-z)" value={lower} onChange={setLower} />
          <ToggleRow label="Digits (0-9)" value={digits} onChange={setDigits} />
          <ToggleRow label="Symbols (!@#…)" value={symbols} onChange={setSymbols} />
        </div>
      </div>
    </Card>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

// ---------------- Hashes ----------------
function HashPanel() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<HashAlgo, string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!input) { setHashes(null); return; }
    hashAll(input).then((h) => { if (!cancelled) setHashes(h); });
    return () => { cancelled = true; };
  }, [input]);

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hash-input">Input text</Label>
        <Textarea id="hash-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type anything to hash…" className="font-mono min-h-[100px]" />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-warning" /> MD5 and SHA-1 are cryptographically broken — shown for educational comparison only.
        </p>
      </div>

      {hashes && (
        <div className="space-y-2">
          <HashRow algo="MD5" value={hashes.md5} warn />
          <HashRow algo="SHA-1" value={hashes.sha1} warn />
          <HashRow algo="SHA-256" value={hashes.sha256} />
          <HashRow algo="SHA-512" value={hashes.sha512} />
        </div>
      )}
    </Card>
  );
}

function HashRow({ algo, value, warn }: { algo: string; value: string; warn?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">{algo}</Badge>
          {warn && <span className="text-[10px] text-warning font-mono">deprecated</span>}
        </div>
        <button
          className="text-muted-foreground hover:text-foreground"
          onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
          aria-label={`Copy ${algo}`}
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className="font-mono text-xs break-all text-primary/90">{value}</div>
    </div>
  );
}

// ---------------- Cracker ----------------
function CrackerPanel() {
  const [hash, setHash] = useState("");
  const [algo, setAlgo] = useState<HashAlgo>("md5");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tried, setTried] = useState(0);
  const [result, setResult] = useState<{ found: boolean; password?: string; time: number } | null>(null);

  const total = DEMO_WORDLIST.length;

  async function run() {
    setRunning(true); setProgress(0); setTried(0); setResult(null);
    const target = hash.trim().toLowerCase();
    const start = performance.now();
    let found: string | undefined;
    for (let i = 0; i < DEMO_WORDLIST.length; i++) {
      const candidate = DEMO_WORDLIST[i];
      // eslint-disable-next-line no-await-in-loop
      const h = await hashOne(algo, candidate);
      setTried(i + 1);
      setProgress(Math.round(((i + 1) / total) * 100));
      if (h === target) { found = candidate; break; }
      if (i % 5 === 0) await new Promise((r) => setTimeout(r, 8)); // yield for UI
    }
    const elapsed = (performance.now() - start) / 1000;
    setResult({ found: !!found, password: found, time: elapsed });
    setRunning(false);
  }

  async function loadDemoHash(value: string) {
    const h = await hashOne(algo, value);
    setHash(h);
  }

  return (
    <Card className="p-6 space-y-5">
      <div className="grid sm:grid-cols-[1fr_auto] gap-3">
        <div className="space-y-2">
          <Label htmlFor="target-hash">Target hash</Label>
          <Input id="target-hash" value={hash} onChange={(e) => setHash(e.target.value)} placeholder="Paste an MD5 / SHA-1 / SHA-256 / SHA-512 hash" className="font-mono" />
        </div>
        <div className="space-y-2">
          <Label>Algorithm</Label>
          <div className="flex gap-1">
            {(["md5", "sha1", "sha256", "sha512"] as HashAlgo[]).map((a) => (
              <Button key={a} size="sm" variant={algo === a ? "default" : "outline"} onClick={() => setAlgo(a)} className="font-mono uppercase">{a}</Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>Try demo hashes:</span>
        {["password", "qwerty", "iloveyou", "letmein"].map((d) => (
          <button key={d} onClick={() => loadDemoHash(d)} className="underline underline-offset-2 hover:text-primary font-mono">{d}</button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={run} disabled={running || !hash} className="gap-2">
          <Cpu className="h-4 w-4" /> {running ? "Cracking…" : "Run dictionary attack"}
        </Button>
        <span className="text-xs font-mono text-muted-foreground">{tried}/{total} attempted</span>
      </div>

      {(running || result) && <Progress value={progress} className="h-2" />}

      {result && (
        <div className={`rounded-lg border p-4 ${result.found ? "border-destructive/40 bg-destructive/10" : "border-primary/40 bg-primary/10"}`}>
          {result.found ? (
            <>
              <div className="text-destructive font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Hash cracked</div>
              <div className="font-mono text-sm mt-1">password: <span className="text-foreground">{result.password}</span></div>
              <div className="text-xs text-muted-foreground mt-1">in {result.time.toFixed(2)}s — {tried} attempts</div>
            </>
          ) : (
            <>
              <div className="text-primary font-medium flex items-center gap-2"><Shield className="h-4 w-4" /> Not in wordlist</div>
              <div className="text-xs text-muted-foreground mt-1">Tried {tried} entries in {result.time.toFixed(2)}s. A real attacker would use much larger lists + rules.</div>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">
        This simulator only checks a small built-in demo wordlist ({total} entries). It demonstrates why fast hashes (MD5/SHA) are unsafe for storing passwords — real attackers run billions of guesses per second on GPUs.
      </p>
    </Card>
  );
}

// ---------------- Learn ----------------
function LearnPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h2 className="font-semibold flex items-center gap-2 mb-3"><BookOpen className="h-4 w-4 text-primary" /> Cybersecurity concepts</h2>
        <dl className="space-y-3 text-sm">
          <Concept term="Entropy" def="Bits of unpredictability. Calculated as length × log₂(charset). 60+ bits is considered strong." />
          <Concept term="Hashing" def="One-way function mapping arbitrary input to a fixed-size digest. Hashes are not encryption." />
          <Concept term="Salt" def="Random value added to each password before hashing so identical passwords yield different hashes." />
          <Concept term="Pepper" def="Server-side secret added to every password — stored separately from the database." />
          <Concept term="bcrypt / Argon2" def="Slow, memory-hard hashing designed for passwords. Drastically harder to brute force than MD5/SHA." />
          <Concept term="Dictionary attack" def="Trying a list of likely passwords/leaked credentials instead of every combination." />
          <Concept term="Rainbow table" def="Precomputed hash lookups. Defeated by per-user salts." />
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold flex items-center gap-2 mb-3"><Terminal className="h-4 w-4 text-primary" /> Interview Q&amp;A</h2>
        <dl className="space-y-3 text-sm">
          <Concept term="Why not MD5/SHA-256 for passwords?" def="They are fast and unsalted — attackers compute billions of guesses per second. Use bcrypt, scrypt, or Argon2id." />
          <Concept term="Hashing vs encryption?" def="Hashing is one-way and irreversible; encryption is two-way and reversible with a key." />
          <Concept term="Why salt?" def="Prevents rainbow tables and ensures identical passwords have different stored hashes." />
          <Concept term="Argon2 vs bcrypt?" def="Argon2id is the modern winner of the Password Hashing Competition — tunable memory, time, and parallelism. bcrypt is still acceptable." />
          <Concept term="How to defend against dictionary attacks?" def="Slow hashing + rate limiting + MFA + breached-password checks + account lockout." />
          <Concept term="What is credential stuffing?" def="Replaying leaked username/password pairs across other services. Mitigated by unique passwords + MFA." />
        </dl>
      </Card>
    </div>
  );
}

function Concept({ term, def }: { term: string; def: string }) {
  return (
    <div>
      <dt className="font-mono text-primary text-xs uppercase tracking-wider">{term}</dt>
      <dd className="text-muted-foreground">{def}</dd>
    </div>
  );
}
