# Password Analyzer & Hash Security Toolkit

An educational cybersecurity playground that runs entirely in your browser. Analyze password strength with entropy scoring, generate MD5/SHA hashes, simulate dictionary attacks, and learn core cryptography concepts — no data ever leaves your device.

> **For educational use only.** Do not use against systems, networks, accounts, or hashes you do not own or have explicit permission to test.

---

## Features

- **Password Analyzer** — Real-time strength scoring using entropy calculation (`entropy = length × log₂(charset size)`), character-class checks, common-password detection, and actionable recommendations.
- **Password Generator** — Cryptographically strong password generation with configurable length and character sets using `crypto.getRandomValues`.
- **Hash Generator** — Generate MD5, SHA-1, SHA-256, and SHA-512 digests instantly. Uses the Web Crypto API for SHA algorithms; includes a pure-JS MD5 implementation for comparison.
- **Dictionary Attack Simulator** — Demo a controlled dictionary crack against a built-in wordlist. Visualizes how fast weak hashes fall to precomputed lists.
- **Cybersecurity Learning Hub** — Interview Q&A and explanations covering hashing vs. encryption, salting, peppering, bcrypt, Argon2, and modern password storage best practices.

---

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — Full-stack React framework with file-based routing
- [React 19](https://react.dev) — UI library
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first styling
- [shadcn/ui](https://ui.shadcn.com) — Accessible component primitives
- [Lucide React](https://lucide.dev) — Icons
- Web Crypto API — Client-side hashing (SHA-1/256/512)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (or use [Bun](https://bun.sh))

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd <repo-name>

# Install dependencies
bun install
# or: npm install
```

### Development

```bash
bun dev
# or: npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Build

```bash
bun run build
# or: npm run build
```

---

## Project Structure

```
├── src/
│   ├── routes/
│   │   ├── index.tsx          # Main app dashboard (analyzer / generator / hashes / cracker / learn)
│   │   └── __root.tsx         # Root layout
│   ├── lib/
│   │   ├── password-analyzer.ts  # Entropy scoring & password generation
│   │   ├── hashing.ts            # MD5/SHA-1/SHA-256/SHA-512 hash engine
│   │   └── wordlist.ts           # Demo wordlist for dictionary attack
│   ├── components/ui/         # shadcn/ui components
│   └── styles.css             # Global styles & theme tokens
├── password-toolkit/          # Original Python CLI version
│   ├── main.py
│   ├── analyzer.py
│   ├── hash_generator.py
│   ├── cracker.py
│   ├── utils.py
│   └── wordlist.txt
├── package.json
├── vite.config.ts
└── README.md
```

---

## How It Works

### Entropy Scoring
Password strength is estimated in bits of entropy:  
`entropy = password.length × log₂(charset_size)`

- **Very Weak** (< 28 bits) — Trivial to guess
- **Weak** (28–40 bits) — Crackable in seconds
- **Medium** (40–60 bits) — Minutes to hours
- **Strong** (60–90 bits) — Years with modern hardware
- **Very Strong** (90+ bits) — Effectively uncrackable

### Hash Generation
- SHA-1, SHA-256, and SHA-512 use the browser's native **Web Crypto API** (`crypto.subtle.digest`).
- MD5 is implemented in pure JavaScript for educational comparison.

### Dictionary Attack
The cracker hashes each entry in a local demo wordlist and compares it against the target hash. A small async yield keeps the UI responsive during the scan.

---

## Cybersecurity Concepts

- **Hash function**: A deterministic, one-way map from arbitrary input to a fixed-size digest. Same input → same digest. A tiny change produces a very different digest (avalanche effect).
- **Entropy**: Estimated bits of unpredictability. Higher entropy → exponentially more candidates an attacker must try.
- **Dictionary attack**: The attacker hashes a curated list of likely passwords and compares to leaked digests. Extremely efficient against unsalted, fast hashes.
- **Brute force**: Tries every combination in the keyspace. Feasibility collapses for high-entropy passwords.
- **Salting**: A unique random value stored per-user, mixed into the hash so identical passwords produce different digests and precomputed rainbow tables become useless.
- **Peppering**: A secret value held outside the database, added to all hashes — defense-in-depth against DB-only leaks.
- **Key stretching / KDFs**: bcrypt, scrypt, and Argon2 deliberately slow the hash computation to make guessing expensive even on GPUs/ASICs.

---

## Python CLI Version

An original menu-driven Python CLI is included under `password-toolkit/` for terminal enthusiasts.

```bash
cd password-toolkit
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

---

## Disclaimer

This toolkit is provided for **cybersecurity education only**. The dictionary attack module is intentionally limited (local wordlist, no salting, no network features). Use it only against hashes you generate yourself.

---

## License

MIT License — feel free to use for learning, teaching, and interview preparation.

web link: https://cyber-charm-toolkit.lovable.app
