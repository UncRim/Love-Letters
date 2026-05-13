#!/usr/bin/env python3
"""
Import every PNG from Heritage "Be My Valentine 02" and "Be My Valentine 03" zips
into public/stamps/ as:

  valentine02-1.png … valentine02-9.png   (pack 02)
  valentine03-1.png … valentine03-8.png   (pack 03)

Copies license PDFs into public/stamps/licenses/.

Requires: macOS `sips` for resize.

Run from repo root:
  python3 scripts/import-valentine-stamps.py
"""

from __future__ import annotations

import re
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = Path.home() / "Downloads"
Z02 = DOWNLOADS / "Be My Valentine 02.zip"
Z03 = DOWNLOADS / "Be My Valentine 03.zip"
DEST = ROOT / "public" / "stamps"
LIC = DEST / "licenses"


def png_members(zpath: Path) -> list[str]:
    with zipfile.ZipFile(zpath) as z:
        names = [
            n
            for n in z.namelist()
            if "/PNG/" in n.replace("\\", "/") and n.lower().endswith(".png")
        ]

    def key(n: str) -> int:
        m = re.search(r"(\d+)\.png$", n)
        return int(m.group(1)) if m else 0

    return sorted(names, key=key)


def extract_pdf(zpath: Path, suffix: str) -> None:
    with zipfile.ZipFile(zpath) as z:
        pdf = next(
            (n for n in z.namelist() if n.endswith("License_HeritageLibrary.pdf")),
            None,
        )
        kittl = next(
            (
                n
                for n in z.namelist()
                if "Kittl" in n and n.lower().endswith(".pdf")
            ),
            None,
        )
        if pdf:
            (LIC / f"{suffix}_Heritage-Library-license.pdf").write_bytes(z.read(pdf))
        if kittl:
            (LIC / f"{suffix}_Kittl.pdf").write_bytes(z.read(kittl))


def resize_one(raw: Path, out: Path) -> None:
    subprocess.run(["sips", "-Z", "256", str(raw), "--out", str(out)], check=True)


def main() -> None:
    if not Z02.is_file() or not Z03.is_file():
        print("Missing zips — expected:", Z02, Z03, file=sys.stderr)
        sys.exit(1)

    m02 = png_members(Z02)
    m03 = png_members(Z03)
    if not m02 or not m03:
        print("No PNGs found in zip PNG/ folders", file=sys.stderr)
        sys.exit(1)

    LIC.mkdir(parents=True, exist_ok=True)
    tmp = ROOT / ".tmp-valentine-import"
    tmp.mkdir(exist_ok=True)

    try:
        n = 0
        for i, member in enumerate(m02, start=1):
            raw = tmp / f"raw-02-{i}.png"
            with zipfile.ZipFile(Z02) as z:
                raw.write_bytes(z.read(member))
            out = DEST / f"valentine02-{i}.png"
            resize_one(raw, out)
            print(out.relative_to(ROOT), out.stat().st_size, "bytes")
            n += 1

        for i, member in enumerate(m03, start=1):
            raw = tmp / f"raw-03-{i}.png"
            with zipfile.ZipFile(Z03) as z:
                raw.write_bytes(z.read(member))
            out = DEST / f"valentine03-{i}.png"
            resize_one(raw, out)
            print(out.relative_to(ROOT), out.stat().st_size, "bytes")
            n += 1

        print("Total:", n, "PNGs")
    finally:
        for p in tmp.glob("raw-*.png"):
            p.unlink(missing_ok=True)
        try:
            tmp.rmdir()
        except OSError:
            pass

    extract_pdf(Z02, "Be-My-Valentine-02")
    extract_pdf(Z03, "Be-My-Valentine-03")
    print("Licenses ->", LIC.relative_to(ROOT))


if __name__ == "__main__":
    main()
