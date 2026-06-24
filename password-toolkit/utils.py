"""Utility helpers: colored output and ASCII banner.

Educational cybersecurity project. Do not use against systems you do not own.
"""

try:
    from colorama import Fore, Style, init as _cinit
    _cinit(autoreset=True)
    _HAS_COLOR = True
except Exception:  # colorama optional
    _HAS_COLOR = False

    class _Dummy:
        def __getattr__(self, _):
            return ""

    Fore = _Dummy()  # type: ignore
    Style = _Dummy()  # type: ignore


def c(text: str, color: str = "") -> str:
    """Wrap text in a color if colorama is available."""
    if not _HAS_COLOR:
        return text
    return f"{color}{text}{Style.RESET_ALL}"


BANNER = r"""
 ____                                     _   _____           _ _    _ _
|  _ \ __ _ ___ _____      _____  _ __ __| | |_   _|__   ___ | | | _(_) |_
| |_) / _` / __/ __\ \ /\ / / _ \| '__/ _` |   | |/ _ \ / _ \| | |/ / | __|
|  __/ (_| \__ \__ \\ V  V / (_) | | | (_| |   | | (_) | (_) | |   <| | |_
|_|   \__,_|___/___/ \_/\_/ \___/|_|  \__,_|   |_|\___/ \___/|_|_|\_\_|\__|

         Password Analyzer & Hash Security Toolkit  -  Educational Use Only
"""


def print_banner() -> None:
    print(c(BANNER, Fore.CYAN))


def hr(char: str = "-", length: int = 70) -> str:
    return char * length


def prompt(message: str) -> str:
    return input(c(f"\n{message} ", Fore.YELLOW)).strip()
