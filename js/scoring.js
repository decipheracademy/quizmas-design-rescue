// Objective scoring rules. Every student is measured the same way.
import { W, H, CONTENT_IDS, overlapArea, outsideArea, contrast, colors, PALETTES, BACKGROUNDS } from "./flyers.js";

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// ---------- Stage 2: layout rules (4 × 10 points) ----------
export function layoutRules(state) {
  const els = CONTENT_IDS.map((id) => state.els[id]);
  const heading = state.els.heading;

  // 1. Heading at the top: it must be the highest element and close to the top.
  const topMost = els.every((e) => e === heading || heading.y <= e.y + 2);
  const headingScore = topMost ? 10 * clamp01(1 - Math.max(0, heading.y - 110) / 200) : 0;

  // 2. Nothing overlapping, and everything inside the safe margins.
  let area = 0;
  for (let i = 0; i < els.length; i++) {
    for (let j = i + 1; j < els.length; j++) area += overlapArea(els[i], els[j]);
    area += outsideArea(els[i]);
  }
  const overlapScore = 10 * clamp01(1 - area / 15000);

  // 3. Lined up: all centred on the flyer, or all sharing a left edge.
  const centreDev = Math.max(...els.map((e) => Math.abs(e.x + e.w / 2 - W / 2)));
  const lefts = els.map((e) => e.x);
  const leftDev = Math.max(...lefts) - Math.min(...lefts);
  const dev = Math.min(centreDev, leftDev);
  const alignScore = 10 * clamp01(1 - Math.max(0, dev - 10) / 80);

  // 4. Even spacing between sections (and no clutter left over).
  const sorted = [...els].sort((a, b) => a.y - b.y);
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) gaps.push(sorted[i].y - (sorted[i - 1].y + sorted[i - 1].h));
  let spacing = 10;
  for (const g of gaps) if (g < 12) spacing -= g < 0 ? 3 : 2;
  const spread = Math.max(...gaps.map((g) => Math.max(0, g))) - Math.min(...gaps.map((g) => Math.max(0, g)));
  if (spread > 30) spacing -= Math.min(5, (spread - 30) / 12);
  spacing -= state.stickers.length * 2;
  const spacingScore = Math.max(0, spacing);

  return {
    heading: round1(headingScore),
    overlap: round1(overlapScore),
    align: round1(alignScore),
    spacing: round1(spacingScore),
    clutterLeft: state.stickers.length,
    gaps,
  };
}

// ---------- Stage 3: final touches (3 × 10 points) ----------
export function paletteScore(key) {
  if (!key || key === "glitch") return 0;
  const p = PALETTES[key];
  const worst = Math.min(contrast(p.text, p.bg), contrast(p.heading, p.bg), contrast(p.tagText, p.tagBg));
  let s = worst >= 7 ? 10 : worst >= 4.5 ? 8 : worst >= 3 ? 4 : 0;
  if (key === "clash") s = Math.max(0, s - 4); // red + green side by side "vibrates" and tires the eyes
  return s;
}
export function readability(stateOrKey) {
  const p = typeof stateOrKey === "string" ? PALETTES[stateOrKey] : colors(stateOrKey);
  const worst = Math.min(contrast(p.text, p.bg), contrast(p.heading, p.bg), contrast(p.tagText, p.tagBg));
  return { ratio: worst, pct: clamp01((worst - 1) / 8) * 100 };
}
export const backgroundScore = (key) => (key ? BACKGROUNDS[key].score : 0);
export function lineSpacingScore(lh) {
  if (lh >= 1.3 && lh <= 1.65) return 10;
  if ((lh >= 1.15 && lh < 1.3) || (lh > 1.65 && lh <= 1.8)) return 6;
  return 0;
}

// ---------- Stage 1 ----------
export function spotScore({ found, hinted, wrong }) {
  const pts = found * 7.5 - (hinted ? 3.75 : 0) - wrong * 2.5;
  return round1(Math.max(0, Math.min(30, pts)));
}

const round1 = (v) => Math.round(v * 10) / 10;

export function level(score) {
  if (score >= 90) return "Master Designer";
  if (score >= 75) return "Design Hero";
  if (score >= 55) return "Rising Designer";
  if (score >= 35) return "Design Apprentice";
  return "Keep Creating";
}

// One thing done well, one thing to improve, picked from the real results.
const FEEDBACK = {
  spot: ["You have a sharp eye: you spotted the design problems quickly and accurately.", "Look closely at how things sit together. Overlaps, crowded gaps and stray pieces are the first clues."],
  heading: ["Great hierarchy: your heading stands out clearly at the top.", "Make the heading the first thing people see by placing it at the top of the flyer."],
  overlap: ["Clean layout: nothing overlaps and everything sits inside the margins.", "Keep text away from pictures and inside the margins so nothing gets covered or cut off."],
  align: ["Neat alignment: your elements line up beautifully.", "Line your elements up along one line (for example, all centred) to make the flyer look organised."],
  spacing: ["Lovely spacing: every section has room to breathe.", "Leave even gaps between sections so the flyer doesn't feel crowded."],
  colour: ["Great colour choice: your text is easy to read on the background.", "Pick colours with strong contrast, like dark text on a light background, so everyone can read the flyer."],
  background: ["Good call: your background supports the text instead of fighting it.", "Choose a calm background. Busy patterns make text hard to read."],
  lines: ["Comfortable reading: your line spacing is just right.", "Give lines of text a little more space so they are easier to read."],
};
export function feedback(cats) {
  const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const best = entries[0][0];
  const worst = entries[entries.length - 1][0];
  const good = entries[0][1] >= 0.5 ? FEEDBACK[best][0] : "You took on Glitch's challenge. Every great designer starts with a first try!";
  const work = entries[entries.length - 1][1] >= 0.95
    ? "Keep practising to make your designs even faster. You're nearly perfect!"
    : FEEDBACK[worst === best ? entries[entries.length - 2][0] : worst][1];
  return { good, work };
}
