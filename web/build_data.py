"""Build web/data.js from the notebook's ranked predictions.

Reads data/breakout_predictions_<season>.csv (written by the last cell of
breakout_predictor.ipynb), pulls each player's headshot from the MLB static CDN,
and inlines everything as one ES module so web/index.html needs no build step,
no server-side code and no network access to render.

    python web/build_data.py --top 25

Players MLB has no headshot on file for come back as a generic silhouette that is
byte-identical for every such player; those are emitted as `"img": null` and the
page draws a monogram instead.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
from pathlib import Path

import pandas as pd
import requests
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
HEADSHOT_URL = (
    "https://img.mlbstatic.com/mlb-photos/image/upload/"
    "d_people:generic:headshot:67:current.png/w_426,q_auto:best"
    "/v1/people/{player_id}/headshot/67/current"
)
GENERIC_MD5 = "94532e9b"  # MLB's "no photo on file" silhouette
THUMB_WIDTH = 220  # 2x the 110px the page renders

TYPEDEF = (
    "/** @typedef {{rank:number,id:number,name:string,team:string,pos:string,"
    "age:number,level:string,pa:number,k:number,bb:number,iso:number,ops:number,"
    "avl:number,score:number,factors:string,img:(string|null)}} Player */"
)


def fetch_headshot(player_id: int) -> str | None:
    """Return a WebP data URI, or None when MLB has no photo for this player."""
    raw = requests.get(HEADSHOT_URL.format(player_id=player_id), timeout=30).content
    if hashlib.md5(raw).hexdigest()[:8] == GENERIC_MD5:
        return None
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    height = round(image.height * THUMB_WIDTH / image.width)
    image = image.resize((THUMB_WIDTH, height), Image.LANCZOS)
    buffer = io.BytesIO()
    image.save(buffer, "WEBP", quality=82, method=6)
    return "data:image/webp;base64," + base64.b64encode(buffer.getvalue()).decode()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--season", type=int, default=2025)
    parser.add_argument("--top", type=int, default=25)
    args = parser.parse_args()

    source = ROOT / "data" / f"breakout_predictions_{args.season}.csv"
    if not source.exists():
        raise SystemExit(f"{source} not found — run breakout_predictor.ipynb first.")

    ranked = pd.read_csv(source).head(args.top)
    players = []
    for rank, row in enumerate(ranked.itertuples(), start=1):
        image = fetch_headshot(int(row.player_id))
        print(f"{rank:>3}. {row.player_name:<24}{'photo' if image else 'monogram'}")
        players.append(
            {
                "rank": rank,
                "id": int(row.player_id),
                "name": row.player_name,
                "team": row.team_name,
                "pos": row.position,
                "age": int(row.age),
                "level": row.level,
                "pa": int(row.PA),
                "k": round(row.K_pct, 3),
                "bb": round(row.BB_pct, 3),
                "iso": round(row.ISO, 3),
                "ops": round(row.OPS, 3),
                "avl": round(row.age_vs_level, 2),
                "score": round(row.breakout_probability, 4),
                "factors": row.top_factors,
                "img": image,
            }
        )

    target = ROOT / "web" / "data.js"
    target.write_text(
        f"// Generated from data/breakout_predictions_{args.season}.csv "
        "by web/build_data.py. Do not edit by hand.\n"
        "// Headshots: MLB static CDN, resized to 220px WebP and inlined so the "
        "page is self-contained.\n\n"
        f"{TYPEDEF}\n\n"
        "/** @type {Player[]} */\n"
        f"export const players = {json.dumps(players, ensure_ascii=False)};\n"
    )
    print(f"\nWrote {len(players)} players to {target.relative_to(ROOT)} "
          f"({target.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
