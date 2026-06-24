# Password Analyzer & Hash Security Toolkit

An educational, menu-driven Python CLI that demonstrates core password and
hashing concepts: strength analysis with entropy, multi-algorithm hash
generation, a dictionary-attack demo, and a weak-vs-strong breach simulation.

> For learning only. Do not run against systems, networks, accounts, or
> hashes you do not own or have explicit permission to test.

## Features

- Password strength analysis (length, character classes, entropy, tier, tips)
- Hash generator: MD5, SHA1, SHA256, SHA512 (clean formatted output)
- Dictionary attack demo against MD5 / SHA256 using a local wordlist
- Breach simulation comparing weak vs strong passwords by entropy
- ASCII banner and colored terminal output (via `colorama`)
- Object-oriented modules with docstrings and error handling

## Project structure

```
password-toolkit/
├── main.py             # menu-driven CLI entry point
├── analyzer.py         # PasswordAnalyzer + entropy scoring
├── hash_generator.py   # HashGenerator for MD5/SHA1/SHA256/SHA512
├── cracker.py          # DictionaryCracker (MD5/SHA256 demo)
├── utils.py            # colors, banner, prompt helpers
├── wordlist.txt        # small demo wordlist
├── requirements.txt
└── README.md
```

## Installation

```bash
cd password-toolkit
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Python 3.9+ recommended.

## Usage

```bash
python main.py
```

You'll see a menu:

```
1) Analyze password strength
2) Generate hashes (MD5 / SHA1 / SHA256 / SHA512)
3) Dictionary attack demo (MD5 / SHA256)
4) Password breach simulation (weak vs strong)
5) About / cybersecurity concepts
0) Exit
```

### Example: analyze

```
Enter password to analyze: Summer2024!
Length          : 11
Charset size    : 72
Entropy (bits)  : 67.89
Strength        : Strong
```

### Example: hashes

```
ALGORITHM  | DIGEST
MD5        | 5f4dcc3b5aa765d61d8327deb882cf99
SHA1       | 5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8
SHA256     | 5e884898da28047151d0e56f8dc629...
SHA512     | b109f3bbbc244eb82441917ed06d61...
```

### Example: dictionary attack (educational)

Generate a hash you own, then crack it from the demo wordlist:

```
python -c "import hashlib; print(hashlib.md5(b'password').hexdigest())"
# 5f4dcc3b5aa765d61d8327deb882cf99
```

Menu option 3 → paste the hash → `md5` → default wordlist path.

```
[+] PASSWORD FOUND: password
Attempts  : 2
Time      : 0.0001 s
```

## Cybersecurity concepts

- **Hash function**: deterministic, one-way map from arbitrary input to a
  fixed-size digest. Same input → same digest. Tiny change → very different
  digest (avalanche effect).
- **Entropy**: estimated bits of unpredictability. We use
  `entropy = length × log2(charset_size)`. Higher entropy → exponentially
  more candidates an attacker must try.
- **Dictionary attack**: attacker hashes a list of likely passwords and
  compares to a leaked digest. Cheap and fast against unsalted, fast hashes.
- **Brute force**: tries every combination in a keyspace. Feasibility
  collapses for high-entropy passwords.
- **Salting**: a unique random value stored with each user, mixed into the
  hash so identical passwords produce different digests and precomputed
  rainbow tables become useless.
- **Peppering**: a secret value held outside the database, added to all
  hashes — defense-in-depth against DB-only leaks.
- **Key stretching / KDFs**: bcrypt, scrypt, Argon2 deliberately slow the
  hash to make guessing expensive even on GPUs/ASICs.

## Interview Q&A

**Q. Why is MD5 (or SHA1) unsuitable for password storage?**
They are designed to be fast and have known collision/preimage weaknesses.
Modern GPUs compute billions of MD5/SHA1 hashes per second, so dictionary
and brute-force attacks against leaked digests are trivial. Use a password
KDF (bcrypt, scrypt, Argon2).

**Q. What is password entropy?**
A measure of unpredictability in bits. With charset size `N` and length
`L`, `entropy = L × log2(N)`. 60 bits is a common minimum target; 80+ bits
is comfortable; 100+ bits is very strong against offline attacks.

**Q. What is a dictionary attack vs. brute force?**
Dictionary attacks try a curated list of likely passwords (leaks, common
words, mangled variants). Brute force enumerates the whole keyspace.
Dictionary is far more efficient against human-chosen passwords.

**Q. What is salting and why does it matter?**
A salt is a unique random value per user, stored alongside the hash. It
prevents identical passwords from producing identical digests and defeats
precomputed rainbow tables. Salts do not need to be secret — only unique.

**Q. bcrypt vs Argon2 — which should I choose?**
Argon2id is the modern recommendation (winner of the Password Hashing
Competition; resistant to GPU and side-channel attacks; tunable memory and
time cost). bcrypt is still acceptable and widely supported, with a tunable
work factor. Avoid plain SHA-256/SHA-512 for passwords.

**Q. What is peppering?**
A server-side secret combined with the password before hashing, stored
outside the database (e.g., in a KMS). If only the database leaks, the
pepper is still required to mount an offline attack.

**Q. Why are long passphrases better than short complex passwords?**
Entropy scales linearly with length and logarithmically with charset size.
Adding length beats adding a symbol — and passphrases are also more
memorable, reducing reuse.

**Q. How should I store passwords in 2026?**
Argon2id with sensible parameters (e.g., memory ≥ 64 MiB, iterations ≥ 3,
parallelism tuned to your hardware), per-user salt, optional server-side
pepper, rate-limit auth endpoints, and require MFA.

## Disclaimer

This toolkit is provided for cybersecurity education. The dictionary attack
module is intentionally limited (MD5/SHA256, local wordlist, no salting, no
network features). Use it only against hashes you generate yourself.
