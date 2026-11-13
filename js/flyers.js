// Flyer data, broken versions and rendering. Flyer space is 600 × 800 "design units".
import { PICTURES } from "./art.js";

export const W = 600, H = 800, MARGIN = 24;
export const SIZES = {
  heading: { w: 540, h: 150 },
  picture: { w: 340, h: 240 },
  details: { w: 460, h: 150 },
  tagline: { w: 400, h: 60 },
  logo: { w: 300, h: 40 },
};
export const CONTENT_IDS = ["heading", "picture", "details", "tagline", "logo"];

// Colour combinations used in Stage 3 (and the messy starting colours).
export const PALETTES = {
  glitch: { name: "Glitch's colours", bg: "#fff4d6", heading: "#f4a261", sub: "#e9c46a", text: "#7fb7d9", tagBg: "#ffd6e8", tagText: "#f28cb1", logoBg: "#e9c46a", logoText: "#fff4d6", accent: "#f4a261" },
  snow: { name: "Snow & Navy", bg: "#ffffff", heading: "#0b2f6b", sub: "#1565c0", text: "#0b2f6b", tagBg: "#0b2f6b", tagText: "#ffffff", logoBg: "#4fc3f7", logoText: "#061a3a", accent: "#4fc3f7" },
  midnight: { name: "Midnight & Gold", bg: "#0b2f6b", heading: "#f6c453", sub: "#9fdcff", text: "#ffffff", tagBg: "#f6c453", tagText: "#2b1d00", logoBg: "#4fc3f7", logoText: "#061a3a", accent: "#f6c453" },
  clash: { name: "Candy Clash", bg: "#ff2d55", heading: "#2bd96b", sub: "#ffe600", text: "#1ec8ff", tagBg: "#2bd96b", tagText: "#ff2d55", logoBg: "#ffe600", logoText: "#2bd96b", accent: "#ffe600" },
  pale: { name: "Pale Frost", bg: "#4fc3f7", heading: "#e6f7ff", sub: "#d0efff", text: "#ffffff", tagBg: "#9fdcff", tagText: "#ffffff", logoBg: "#ffffff", logoText: "#9fdcff", accent: "#ffffff" },
};
export const PALETTE_CHOICES = ["snow", "clash", "midnight", "pale"];

export const BACKGROUNDS = {
  plain: { name: "Plain", score: 8 },
  snow: { name: "Soft snow", score: 10 },
  stripes: { name: "Candy stripes", score: 0 },
  confetti: { name: "Confetti", score: 2 },
};
export const BACKGROUND_CHOICES = ["stripes", "snow", "confetti", "plain"];

const STICKERS = ["🍕", "⚽", "🕶️", "🎸", "🐸", "🌮"];

// Three versions of the broken flyer. Each has exactly four problems to find.
export const VARIANTS = [
  {
    key: "carol",
    title: "QUIZMAS CAROL NIGHT", sub: "SONGS · LIGHTS · HOT COCOA",
    details: [["📅", "Friday, 18 December"], ["🕔", "5:00 PM"], ["📍", "School Main Hall"]],
    tagline: "Free entry · Bring a friend!",
    picture: "carol",
    broken: {
      heading: { x: 150, y: 600 }, picture: { x: 140, y: 150 }, details: { x: 50, y: 330 },
      tagline: { x: 120, y: 482 }, logo: { x: 6, y: 10 },
    },
    colorFix: {},
    stickers: [],
    problems: [
      { id: "heading", label: "Heading in a poor spot, running off the edge", rect: [150, 600, 450, 150] },
      { id: "overlap", label: "Text overlapping the picture", rect: [140, 330, 340, 60] },
      { id: "scattered", label: "Logo scattered into the corner", rect: [6, 10, 300, 40] },
      { id: "cramped", label: "No space between sections", rect: [120, 462, 400, 40] },
    ],
  },
  {
    key: "talent",
    title: "CHRISTMAS TALENT SHOW", sub: "SING · DANCE · ACT · SHINE",
    details: [["📅", "Thursday, 17 December"], ["🕑", "2:00 PM"], ["📍", "School Auditorium"]],
    tagline: "Sign up with your class teacher",
    picture: "talent",
    broken: {
      heading: { x: 30, y: 210 }, picture: { x: 130, y: 120 }, details: { x: 70, y: 440 },
      tagline: { x: 250, y: 610 }, logo: { x: 150, y: 740 },
    },
    colorFix: { text: "#f1e3b5" },
    stickers: [{ x: 360, y: 20 }, { x: 430, y: 40 }, { x: 500, y: 16 }, { x: 395, y: 92 }, { x: 470, y: 100 }, { x: 520, y: 80 }],
    problems: [
      { id: "overlap", label: "Heading crashing into the picture", rect: [130, 210, 340, 150] },
      { id: "scattered", label: "Tagline drifting off the side", rect: [250, 610, 350, 60] },
      { id: "contrast", label: "Details too pale to read", rect: [70, 440, 460, 150] },
      { id: "clutter", label: "Random stickers cluttering the top", rect: [356, 12, 236, 160] },
    ],
  },
  {
    key: "toys",
    title: "SANTA'S TOY DRIVE", sub: "GIVE A TOY · SHARE A SMILE",
    details: [["📅", "14 – 18 December"], ["🕗", "8:00 AM – 3:00 PM"], ["📍", "Drop-off: School Library"]],
    tagline: "Every toy makes a child smile",
    picture: "toys",
    broken: {
      heading: { x: 30, y: 300 }, picture: { x: 240, y: 30 }, details: { x: 70, y: 452 },
      tagline: { x: 100, y: 604 }, logo: { x: 150, y: 668 },
    },
    colorFix: { tagText: "#ffe9f2" },
    stickers: [{ x: 20, y: 30 }, { x: 90, y: 20 }, { x: 40, y: 110 }, { x: 120, y: 96 }, { x: 160, y: 30 }, { x: 70, y: 176 }],
    problems: [
      { id: "heading", label: "Heading lost in the middle", rect: [30, 300, 540, 150] },
      { id: "cramped", label: "Sections squashed together", rect: [150, 650, 300, 34] },
      { id: "contrast", label: "Tagline too pale to read", rect: [100, 604, 400, 60] },
      { id: "clutter", label: "Random stickers cluttering the corner", rect: [14, 14, 230, 236] },
    ],
  },
];

export function makeState(variant) {
  const els = {};
  for (const id of CONTENT_IDS) els[id] = { id, ...SIZES[id], ...variant.broken[id] };
  const stickers = variant.stickers.map((p, i) => ({ id: "s" + i, emoji: STICKERS[i % STICKERS.length], x: p.x, y: p.y, w: 70, h: 70 }));
  return { variant, els, stickers, palette: "glitch", colorFix: { ...variant.colorFix }, background: "plain", lineHeight: 0.95 };
}

export function cloneState(s) {
  return {
    variant: s.variant,
    els: Object.fromEntries(Object.entries(s.els).map(([k, v]) => [k, { ...v }])),
    stickers: s.stickers.map((x) => ({ ...x })),
    palette: s.palette, colorFix: { ...s.colorFix }, background: s.background, lineHeight: s.lineHeight,
  };
}

export function bgCSS(state, p) {
  switch (state.background) {
    case "stripes": return "repeating-linear-gradient(45deg, #e5484d 0 26px, #ffffff 26px 52px)";
    case "confetti": return `radial-gradient(circle, #ffe600 0 5px, transparent 6px) 0 0/38px 38px, radial-gradient(circle, #2bd96b 0 5px, transparent 6px) 19px 12px/38px 38px, radial-gradient(circle, #ff2d55 0 5px, transparent 6px) 8px 25px/30px 30px, ${p.bg}`;
    case "snow": return `radial-gradient(circle, ${p.accent}33 0 3px, transparent 4px) 0 0/46px 46px, radial-gradient(circle, ${p.accent}22 0 2px, transparent 3px) 23px 23px/46px 46px, linear-gradient(180deg, ${p.bg}, ${shade(p.bg)})`;
    default: return p.bg;
  }
}
function shade(hex) {
  const [r, g, b] = rgb(hex);
  const k = luminance(hex) > 0.5 ? -18 : 18;
  return `rgb(${clamp(r + k)}, ${clamp(g + k)}, ${clamp(b + k)})`;
}
const clamp = (v) => Math.max(0, Math.min(255, v));

export function colors(state) {
  return { ...PALETTES[state.palette], ...(state.palette === "glitch" ? state.colorFix : {}) };
}

// Render the flyer into a container. Returns the .flyer element.
export function renderFlyer(container, state, { interactive = false } = {}) {
  const v = state.variant;
  const p = colors(state);
  container.innerHTML = "";
  const f = document.createElement("div");
  f.className = "flyer";
  f.style.background = bgCSS(state, p);
  f.style.color = p.text;
  const margin = document.createElement("div");
  margin.className = "margin-box";
  f.appendChild(margin);

  const add = (id, html, style = {}) => {
    const e = state.els[id];
    const d = document.createElement("div");
    d.className = "el " + id + (interactive ? " movable" : "");
    d.dataset.id = id;
    Object.assign(d.style, { left: e.x + "px", top: e.y + "px", width: e.w + "px", height: e.h + "px" }, style);
    d.innerHTML = html;
    f.appendChild(d);
    return d;
  };
  add("picture", PICTURES[v.picture]);
  add("heading", `${v.title}<small style="color:${p.sub}">${v.sub}</small>`, { color: p.heading });
  const det = add("details", v.details.map(([i, t]) => `<div class="d-line"><i>${i}</i><span>${t}</span></div>`).join(""), { color: p.text });
  det.style.setProperty("--lh", state.lineHeight);
  add("tagline", v.tagline, { background: p.tagBg, color: p.tagText });
  add("logo", "QUIZMAS SEASON 3", { background: p.logoBg, color: p.logoText });
  for (const s of state.stickers) {
    const d = document.createElement("div");
    d.className = "el sticker" + (interactive ? " movable" : "");
    d.dataset.id = s.id;
    d.dataset.sticker = "1";
    Object.assign(d.style, { left: s.x + "px", top: s.y + "px", width: s.w + "px", height: s.h + "px" });
    d.textContent = s.emoji;
    f.appendChild(d);
  }
  container.appendChild(f);
  return f;
}

// Scale a rendered flyer to fit a box (keeps 3:4).
export function fitFlyer(holder, flyer, maxW, maxH) {
  const s = Math.min(maxW / W, maxH / H);
  holder.style.width = W * s + "px";
  holder.style.height = H * s + "px";
  flyer.style.transform = `scale(${s})`;
  return s;
}

// Scale and centre a rendered flyer inside any box (used on the noticeboard and before/after view).
export function fitInside(container, flyer) {
  const cw = container.clientWidth, ch = container.clientHeight;
  const s = Math.min(cw / W, ch / H);
  flyer.style.transform = `translate(${(cw - W * s) / 2}px, ${(ch - H * s) / 2}px) scale(${s})`;
  return s;
}

// ---- measurements used by scoring ----
export const rectOf = (e) => ({ x: e.x, y: e.y, w: e.w, h: e.h });
export function overlapArea(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}
export function outsideArea(e) {
  const inner = { x: MARGIN, y: MARGIN, w: W - MARGIN * 2, h: H - MARGIN * 2 };
  return e.w * e.h - overlapArea(e, inner);
}

export function rgb(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16));
}
export function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
