"""Password Analyzer & Hash Security Toolkit - menu-driven CLI.

Educational cybersecurity project. Do not use against systems, networks,
accounts, or hashes you do not own or have explicit permission to test.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from analyzer import PasswordAnalyzer
from cracker import DictionaryCracker
from hash_generator import HashGenerator, SUPPORTED_ALGOS
from utils import Fore, c, hr, print_banner, prompt

WORDLIST = str(Path(__file__).parent / "wordlist.txt")


def menu() -> str:
    print(c("\n" + hr("="), Fore.BLUE))
    print(c("  MAIN MENU", Fore.CYAN))
    print(c(hr("="), Fore.BLUE))
    print("  1) Analyze password strength")
    print("  2) Generate hashes (MD5 / SHA1 / SHA256 / SHA512)")
    print("  3) Dictionary attack demo (MD5 / SHA256)")
    print("  4) Password breach simulation (weak vs strong)")
    print("  5) About / cybersecurity concepts")
    print("  0) Exit")
    return prompt("Select an option:")


def do_analyze() -> None:
    pwd = prompt("Enter password to analyze:")
    res = PasswordAnalyzer().analyze(pwd)

    color = {
        "Weak": Fore.RED,
        "Medium": Fore.YELLOW,
        "Strong": Fore.GREEN,
        "Very Strong": Fore.CYAN,
    }[res.strength]

    print(c("\n" + hr(), Fore.BLUE))
    print(c("  PASSWORD ANALYSIS", Fore.CYAN))
    print(c(hr(), Fore.BLUE))
    print(f"  Length          : {res.password_length}")
    print(f"  Lowercase       : {res.has_lower}")
    print(f"  Uppercase       : {res.has_upper}")
    print(f"  Digits          : {res.has_digit}")
    print(f"  Symbols         : {res.has_symbol}")
    print(f"  Charset size    : {res.charset_size}")
    print(f"  Entropy (bits)  : {res.entropy}")
    print(f"  Strength        : {c(res.strength, color)}")
    print(c("\nRecommendations:", Fore.YELLOW))
    for r in res.recommendations:
        print(f"  - {r}")


def do_hash() -> None:
    text = prompt("Enter text to hash:")
    hashes = HashGenerator().generate_all(text)
    print(c("\n" + hr(), Fore.BLUE))
    print(f"  {'ALGORITHM':<10} | DIGEST")
    print(c(hr(), Fore.BLUE))
    for algo, digest in hashes.items():
        print(f"  {algo.upper():<10} | {digest}")


def do_crack() -> None:
    target = prompt("Enter target hash (hex):")
    algo = prompt("Algorithm (md5 / sha256):").lower() or "md5"
    path = prompt(f"Wordlist path [default: {WORDLIST}]:") or WORDLIST

    print(c(f"\n[*] Running dictionary attack ({algo}) ...", Fore.YELLOW))
    try:
        result = DictionaryCracker().crack(target, algo, path)
    except (ValueError, FileNotFoundError) as e:
        print(c(f"[!] {e}", Fore.RED))
        return

    print(c(hr(), Fore.BLUE))
    if result.found:
        print(c(f"  [+] PASSWORD FOUND: {result.password}", Fore.GREEN))
    else:
        print(c("  [-] Password not found in wordlist.", Fore.RED))
    print(f"  Algorithm : {result.algo}")
    print(f"  Attempts  : {result.attempts}")
    print(f"  Time      : {result.elapsed_seconds:.4f} s")


def do_breach_sim() -> None:
    analyzer = PasswordAnalyzer()
    samples = ["123456", "password1", "Summer2024!", "CorrectHorseBatteryStaple9!"]
    print(c("\nWhy weak passwords fall fast:", Fore.YELLOW))
    print("  Attackers do not 'guess' - they hash billions of candidates per second")
    print("  from leaked wordlists. Low-entropy passwords appear early in those lists.")
    print(c("\n" + hr(), Fore.BLUE))
    print(f"  {'PASSWORD':<32} {'ENTROPY':>9}  STRENGTH")
    print(c(hr(), Fore.BLUE))
    for s in samples:
        r = analyzer.analyze(s)
        print(f"  {s:<32} {r.entropy:>9.2f}  {r.strength}")
    print(c("\nTakeaway:", Fore.CYAN), "long passphrases beat short 'complex' passwords.")


def do_about() -> None:
    print(c("\nCybersecurity concepts:", Fore.CYAN))
    print("  - Hashing: one-way function mapping input -> fixed-size digest.")
    print("  - Entropy: bits of unpredictability; higher = harder to brute force.")
    print("  - Dictionary attack: try known/common passwords from a wordlist.")
    print("  - Salting: per-user random value mixed in before hashing.")
    print("  - bcrypt / Argon2: slow, salted KDFs designed for password storage.")
    print("  - MD5 / SHA1: fast and broken for passwords - do NOT use.")


def main() -> int:
    os.system("")  # enable ANSI on Windows terminals
    print_banner()
    actions = {
        "1": do_analyze,
        "2": do_hash,
        "3": do_crack,
        "4": do_breach_sim,
        "5": do_about,
    }
    while True:
        try:
            choice = menu()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0
        if choice == "0":
            print(c("Goodbye.", Fore.CYAN))
            return 0
        action = actions.get(choice)
        if not action:
            print(c("Invalid option.", Fore.RED))
            continue
        try:
            action()
        except KeyboardInterrupt:
            print(c("\n[!] Cancelled.", Fore.RED))
        except Exception as e:  # defensive
            print(c(f"[!] Error: {e}", Fore.RED))


if __name__ == "__main__":
    sys.exit(main())
