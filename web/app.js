// @ts-check
/**
 * Renders the breakout board from the scored player list.
 * Type-checkable with `tsc --allowJs --checkJs --noEmit app.js`.
 */

import { players } from "./data.js";

/** @typedef {import("./data.js").Player} Player */

/** Ordinal rank of each level, used for the colour ramp on the level chip. */
const LEVEL_RANK = { A: 1, "A+": 2, AA: 3, AAA: 4 };

/** The model sees `level_ord` as a number; a reader wants the level's name back. */
const LEVEL_NAME = ["", "A", "A+", "AA", "AAA"];

/** Model feature names as a scout would say them. */
const FEATURE_LABELS = {
  age: "Age",
  age_vs_level: "Age vs. level",
  level_ord: "Level",
  PA: "PA",
  K_pct: "K%",
  BB_pct: "BB%",
  BB_K: "BB/K",
  ISO: "ISO",
  OPS: "OPS",
  BABIP: "BABIP",
  HR_rate: "HR rate",
  SB_success: "SB success",
  k_minus_bb: "K% − BB%",
  iso_x_level: "ISO × level",
  young_for_level: "Young for level",
};

/**
 * Baseball rate stats are written without the leading zero: .318, not 0.318.
 * @param {number} value
 * @param {number} places
 */
const dropLeadingZero = (value, places) =>
  value.toFixed(places).replace(/^0\./, ".").replace(/^-0\./, "-.");

/** @param {number} value */
const asPercent = (value) => `${(value * 100).toFixed(1)}%`;

/**
 * Signed years relative to the level's average age, e.g. "−3.7 yr".
 * @param {number} value
 */
const asYearsVsLevel = (value) =>
  `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(1)} yr`;

/**
 * Splits the notebook's `top_factors` string — "+OPS (0.991), -age_vs_level (-3.136)"
 * — into the three SHAP drivers behind a player's score. The leading sign is the
 * direction of the SHAP contribution; the number in parentheses is the feature value.
 * @param {string} raw
 * @returns {{label: string, value: string, raised: boolean}[]}
 */
function parseFactors(raw) {
  return raw.split("), ").map((part) => {
    const match = /^([+-])(\w+)\s*\(([-\d.]+)\)?$/.exec(part.trim());
    if (!match) return { label: part.trim(), value: "", raised: true };
    const [, sign, feature, value] = match;
    const number = Number(value);
    const label = FEATURE_LABELS[feature] ?? feature;
    let shown;
    if (feature === "level_ord") {
      shown = LEVEL_NAME[Math.round(number)] ?? String(Math.round(number));
    } else if (feature === "age" || feature === "PA") {
      shown = String(Math.round(number));
    } else if (feature === "age_vs_level") {
      shown = asYearsVsLevel(number);
    } else if (Math.abs(number) < 1) {
      shown = dropLeadingZero(number, 3);
    } else {
      shown = number.toFixed(2);
    }
    return { label, value: shown, raised: sign === "+" };
  });
}

/** @param {string} name */
const initials = (name) =>
  name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * @param {string} tag
 * @param {string} className
 * @param {string} [text]
 */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * @param {string} term
 * @param {string} value
 */
function statPair(term, value) {
  const wrap = document.createElement("div");
  wrap.append(el("dt", "", term), el("dd", "", value));
  return wrap;
}

/** @param {Player} player */
function renderPlayer(player) {
  const row = el("li", "player");

  row.append(el("span", "rank", String(player.rank).padStart(2, "0")));

  const shot = el("div", "shot");
  if (player.img) {
    const img = document.createElement("img");
    img.src = player.img;
    img.alt = `${player.name}, ${player.team}`;
    img.loading = player.rank > 6 ? "lazy" : "eager";
    img.decoding = "async";
    shot.append(img);
  } else {
    // MLB has no headshot on file for this player yet; a monogram beats their
    // generic silhouette, which is identical for every such player.
    const mono = el("div", "monogram", initials(player.name));
    mono.setAttribute("role", "img");
    mono.setAttribute("aria-label", `${player.name}, no headshot available`);
    shot.append(mono);
  }
  row.append(shot);

  const bio = el("div", "bio");
  bio.append(el("h3", "", player.name));

  const meta = el("p", "meta");
  const level = el("span", `lvl lvl-${LEVEL_RANK[player.level] ?? 1}`, player.level);
  meta.append(
    level,
    el("span", "", player.pos),
    el("span", "sep", "/"),
    el("span", "", `Age ${player.age}`),
    el("span", "sep", "/"),
    el("span", "", player.team),
  );
  bio.append(meta);

  const stats = el("dl", "stats");
  stats.append(
    statPair("PA", String(player.pa)),
    statPair("OPS", dropLeadingZero(player.ops, 3)),
    statPair("ISO", dropLeadingZero(player.iso, 3)),
    statPair("K%", asPercent(player.k)),
    statPair("BB%", asPercent(player.bb)),
    statPair("Age vs. lvl", asYearsVsLevel(player.avl)),
  );
  bio.append(stats);

  const factors = el("ul", "factors");
  for (const factor of parseFactors(player.factors)) {
    const chip = el("li", factor.raised ? "up" : "down");
    const arrow = el("span", "arrow", factor.raised ? "↑" : "↓");
    arrow.setAttribute("aria-label", factor.raised ? "raised score" : "lowered score");
    chip.append(arrow, el("span", "", factor.label));
    if (factor.value) chip.append(el("span", "val", factor.value));
    factors.append(chip);
  }
  bio.append(factors);
  row.append(bio);

  const score = el("div", "score");
  score.append(
    el("span", "num", dropLeadingZero(player.score, 3)),
    el("span", "cap", "score"),
  );
  row.append(score);

  return row;
}

const board = document.getElementById("board");
if (board) {
  const fragment = document.createDocumentFragment();
  for (const player of players) fragment.append(renderPlayer(player));
  board.append(fragment);
}
