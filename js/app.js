// Design Rescue: Fix That Flyer. Main game flow.
import { startSnow } from "./snow.js";
import { glitchSVG } from "./art.js";
import * as audio from "./audio.js";
import {
  W, H, VARIANTS, PALETTES, PALETTE_CHOICES, BACKGROUNDS, BACKGROUND_CHOICES, CONTENT_IDS,
  makeState, cloneState, renderFlyer, fitFlyer, fitInside, bgCSS,
} from "./flyers.js";
import { layoutRules, paletteScore, readability, backgroundScore, lineSpacingScore, spotScore, level, feedback } from "./scoring.js";
import { attemptsSoFar, registerAttempt, saveResult, flush, normaliseId } from "./storage.js";
import { burst, confetti, makeBadge } from "./fx.js";

const CFG = window.DR_CONFIG;
// Testing switches: ?v=0|1|2 picks a flyer version, ?fast=1 shortens every stage to 4 seconds.
const PARAMS = new URLSearchParams(location.search);
if (PARAMS.get("fast") === "1") CFG.STAGE_TIME = { 1: 4, 2: 4, 3: 4 };
const gsap = window.gsap;
const $ = (id) => document.getElementById(id);
const sfx = audio.sfx;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const S = {
  player: null, attempt: 0, official: false, variantIndex: -1,
  broken: null, work: null, flyerEl: null, scale: 1,
  spot: null, rules: null, touches: null, times: {}, startedAt: 0,
  choices: { palette: null, background: null, lineHeight: 0.95 },
};
window.__DR = S; // used by automated tests

// ---------------------------------------------------------------- screens
let current = "loader";
function show(id) {
  const from = $(current), to = $(id);
  if (from === to) return;
  gsap.to(from, { opacity: 0, duration: 0.25, onComplete: () => { from.classList.remove("active"); from.style.opacity = ""; } });
  to.classList.add("active");
  gsap.fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.35, delay: 0.15 });
  current = id;
}

let toastTimer = null;
function toast(msg, bad = false) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.toggle("bad", bad);
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

// ---------------------------------------------------------------- Glitch
function mountGlitch(el, mood = "grin") {
  el.classList.add("glitch");
  el.innerHTML = glitchSVG(mood);
}
function glitchReact(mood, line) {
  if (!CFG.SHOW_GLITCH) return;
  const el = $("glitchMini");
  mountGlitch(el, mood === "sulk" ? "sulk" : "grin");
  el.classList.remove("giggle", "sulk");
  void el.offsetWidth;
  el.classList.add(mood);
  if (line) says(line);
}
function says(line) {
  const b = $("glitchSays");
  if (!b || !CFG.SHOW_GLITCH) return;
  b.textContent = line;
  b.hidden = false;
  gsap.fromTo(b, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" });
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const LINES = {
  hit: ["Hey! You weren't supposed to see that!", "Grr… lucky guess.", "Okay, that one was obvious.", "NOOO! My best mistake!"],
  miss: ["Hehe, nothing wrong there!", "Wrong spot! Keep looking!", "Tee-hee, try again!"],
  fix: ["Stop tidying my mess!", "Hmph. That does look better.", "Who taught you all this?!"],
  sticker: ["My stickers! I loved those!", "Not the pizza sticker!", "Fine, take them away…"],
};

// ---------------------------------------------------------------- loader
const TIPS = [
  "Tip: Good spacing lets every part of a design breathe.",
  "Tip: Your heading should be the first thing people notice.",
  "Tip: Dark text on a light background is easy to read.",
  "Tip: Lining things up makes a design look organised.",
  "Tip: Too many decorations make a flyer feel cluttered.",
];
const STATUS = ["Wrapping your Quizmas surprise…", "Tying the ribbons…", "Polishing the ornaments…", "Dusting off the snow…", "Almost ready…"];

async function runLoader() {
  const fill = document.querySelector(".loader-fill");
  const bar = document.querySelector(".loader-bar");
  const start = performance.now();
  let real = 0, giftModule = null;
  const tasks = [
    document.fonts.load("800 20px 'Baloo 2'").then(() => document.fonts.load("700 20px 'Mountains of Christmas'")).then(() => document.fonts.load("800 20px Nunito")).then(() => document.fonts.load("400 20px Nunito")).catch(() => {}),
    import("./gift3d.js").then((m) => { giftModule = m; }).catch(() => { giftModule = null; }),
    new Promise((r) => setTimeout(r, 300)),
  ];
  tasks.forEach((p) => p.then(() => { real += 1 / tasks.length; }));
  let tipIndex = 0;
  const tipTimer = setInterval(() => {
    tipIndex = (tipIndex + 1) % TIPS.length;
    const tip = $("loaderTip");
    gsap.to(tip, { opacity: 0, duration: 0.2, onComplete: () => { tip.textContent = TIPS[tipIndex]; gsap.to(tip, { opacity: 1, duration: 0.3 }); } });
  }, 2000);

  await new Promise((resolve) => {
    let shown = 0;
    const step = () => {
      const timeFrac = Math.min(1, (performance.now() - start) / CFG.LOADER_MIN_MS);
      const target = Math.min(real, timeFrac);
      shown += (target - shown) * 0.12 + 0.002;
      shown = Math.min(shown, target);
      const pct = Math.round(shown * 100);
      fill.style.width = pct + "%";
      bar.setAttribute("aria-valuenow", pct);
      $("loaderPct").textContent = pct + "%";
      $("loaderText").textContent = STATUS[Math.min(STATUS.length - 1, Math.floor(shown * STATUS.length))];
      if (shown >= 0.999 && real >= 1 && timeFrac >= 1) return resolve();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  clearInterval(tipTimer);
  $("loaderPct").textContent = "100%";
  await gsap.to(".loader-card", { scale: 1.08, opacity: 0, duration: 0.45, ease: "power2.in" });
  return giftModule;
}

// ---------------------------------------------------------------- gift + title
let gift = null;
function showGift(giftModule) {
  show("gift");
  const reveal = () => {
    $("giftHint").style.display = "none";
    const tr = $("titleReveal");
    tr.style.display = "block";
    gsap.from(".title-reveal .track", { y: 20, opacity: 0, duration: 0.5 });
    gsap.from(".game-title span", { scale: 0, rotation: (i) => (i ? 8 : -8), opacity: 0, duration: 0.8, stagger: 0.18, ease: "back.out(2.2)" });
    gsap.from(".game-sub", { y: 20, opacity: 0, duration: 0.5, delay: 0.5 });
    gsap.from("#startBtn", { scale: 0, opacity: 0, duration: 0.6, delay: 0.75, ease: "back.out(2)" });
    gsap.to("#startBtn", { scale: 1.05, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.5 });
    audio.startMusic();
  };
  const tryWebGL = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } };
  if (giftModule && tryWebGL() && !reduceMotion) {
    gift = giftModule.createGift($("giftStage"), { sfx, onOpened: reveal });
    $("gift").addEventListener("pointerdown", () => { audio.unlock(); gift.open(); gsap.to("#giftHint", { opacity: 0, duration: 0.3 }); }, { once: true });
  } else {
    // No 3D available (or reduced motion): go straight to the title.
    $("giftHint").textContent = "";
    reveal();
  }
}

// ---------------------------------------------------------------- entry
function setupEntry() {
  const form = $("entryForm");
  const err = $("entryError");
  const note = $("attemptNote");
  const btn = form.querySelector("button");
  $("quizmasId").addEventListener("input", () => { note.textContent = ""; btn.textContent = "Continue"; });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("playerName").value.trim().replace(/\s+/g, " ");
    const id = normaliseId($("quizmasId").value);
    if (name.length < 2) { err.textContent = "Please enter your name."; $("playerName").focus(); sfx.wrong(); return; }
    if (!/^[A-Z0-9-]{3,20}$/.test(id)) { err.textContent = "Please enter your Quizmas ID (letters, numbers and dashes)."; $("quizmasId").focus(); sfx.wrong(); return; }
    err.textContent = "";
    const played = attemptsSoFar(id);
    if (played > 0 && !note.textContent) {
      note.textContent = "You've already played Design Rescue, so this round is practice. Your first score stays as your official score.";
      btn.textContent = "Continue (practice)";
      return;
    }
    S.player = { name, id };
    sfx.pop();
    showStory();
  });
}

// ---------------------------------------------------------------- story
async function typeText(el, text) {
  el.textContent = "";
  for (const ch of text) {
    el.textContent += ch;
    await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 22));
  }
}
let storyRun = 0;
async function showStory() {
  show("story");
  const run = ++storyRun;
  const sp = $("storySpeech");
  if (!CFG.SHOW_GLITCH) { $("glitchStory").style.display = "none"; sp.style.display = "none"; return; }
  gsap.from("#glitchStory", { y: 60, opacity: 0, rotation: -10, duration: 0.7, ease: "back.out(1.8)", delay: 0.2 });
  gsap.from(".story-card", { y: 40, opacity: 0, duration: 0.6, delay: 0.5 });
  await new Promise((r) => setTimeout(r, 600));
  if (run !== storyRun) return;
  await typeText(sp, `Hehehe! I'm Glitch, ${S.player.name.split(" ")[0]}. I scrambled the Quizmas flyer the night before the big event!`);
  await new Promise((r) => setTimeout(r, 900));
  if (run !== storyRun) return;
  await typeText(sp, "Bet you can't fix it before the doors open… tick tock! ⏰");
}

// ---------------------------------------------------------------- round setup
function chooseVariant() {
  const forced = PARAMS.get("v");
  if (forced !== null && VARIANTS[Number(forced)]) { S.variantIndex = Number(forced); return VARIANTS[S.variantIndex]; }
  let i;
  do { i = Math.floor(Math.random() * VARIANTS.length); } while (VARIANTS.length > 1 && i === S.variantIndex);
  S.variantIndex = i;
  return VARIANTS[i];
}

function startRound() {
  const before = attemptsSoFar(S.player.id);
  S.attempt = registerAttempt(S.player.id);
  S.official = before === 0;
  const variant = chooseVariant();
  S.broken = makeState(variant);
  S.work = cloneState(S.broken);
  S.spot = null; S.rules = null; S.touches = null; S.times = {};
  S.choices = { palette: null, background: null, lineHeight: 0.95 };
  S.startedAt = performance.now();
  show("game");
  if (!$("glitchSays")) {
    const p = document.createElement("p");
    p.id = "glitchSays";
    p.className = "says";
    p.hidden = true;
    $("side").insertBefore(p, $("sideBody"));
  }
  mountGlitch($("glitchMini"));
  if (!CFG.SHOW_GLITCH) $("glitchMini").style.display = "none";
  setTimeout(stage1, 350);
}

// ---------------------------------------------------------------- flyer layout
function drawFlyer(state, interactive = false) {
  S.flyerEl = renderFlyer($("flyerHolder"), state, { interactive });
  if (interactive) S.flyerEl.classList.add("draggable");
  layoutFlyer();
  return S.flyerEl;
}
function layoutFlyer() {
  if (!S.flyerEl) return;
  const r = $("flyerArea").getBoundingClientRect();
  S.scale = fitFlyer($("flyerHolder"), S.flyerEl, r.width * 0.96, r.height * 0.96);
}
function toFlyer(e) {
  const r = S.flyerEl.getBoundingClientRect();
  return { x: (e.clientX - r.left) / S.scale, y: (e.clientY - r.top) / S.scale };
}
function flyerToScreen(x, y) {
  const r = S.flyerEl.getBoundingClientRect();
  return { x: r.left + x * S.scale, y: r.top + y * S.scale };
}

function setStageDots(n) {
  document.querySelectorAll("#stageDots span").forEach((s) => {
    const k = Number(s.dataset.s);
    s.classList.toggle("on", k === n);
    s.classList.toggle("done", k < n);
  });
}
function setSide(title, text) {
  $("sideTitle").textContent = title;
  $("sideText").textContent = text;
  $("sideBody").innerHTML = "";
  $("sideActions").innerHTML = "";
}
function actionButton(label, cls, fn) {
  const b = document.createElement("button");
  b.className = "btn " + cls;
  b.textContent = label;
  b.addEventListener("click", fn);
  $("sideActions").appendChild(b);
  return b;
}

// Stage introduction card (the timer starts when the student taps Go).
function stageCard(n, title, text, line) {
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.className = "stage-card";
    wrap.innerHTML = `<div class="panel"><p class="season">Stage ${n} of 3</p><h2>${title}</h2><p class="muted">${text}</p>${line && CFG.SHOW_GLITCH ? `<p class="says big">${line}</p>` : ""}<button class="btn btn-gold">Go!</button></div>`;
    $("game").appendChild(wrap);
    gsap.fromTo(wrap.firstChild, { y: 40, scale: 0.9, opacity: 0, rotationX: -25 }, { y: 0, scale: 1, opacity: 1, rotationX: 0, duration: 0.55, ease: "back.out(1.6)" });
    wrap.querySelector("button").addEventListener("click", () => {
      sfx.pop();
      gsap.to(wrap, { opacity: 0, duration: 0.25, onComplete: () => { wrap.remove(); resolve(); } });
    });
  });
}

// ---------------------------------------------------------------- timer
let timer = null;
function startTimer(seconds, onEnd) {
  stopTimer();
  const ring = $("timerRing"), text = $("timerText"), box = $("timer");
  const end = performance.now() + seconds * 1000;
  let lastSec = seconds + 1;
  const tick = () => {
    const left = Math.max(0, (end - performance.now()) / 1000);
    const sec = Math.ceil(left);
    text.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
    ring.style.strokeDashoffset = String(97.4 * (1 - left / seconds));
    box.classList.toggle("low", left <= seconds * 0.3 && left > 10);
    box.classList.toggle("crit", left <= 10);
    if (sec !== lastSec && sec <= 10 && sec > 0) sfx.tick();
    lastSec = sec;
    if (left <= 0) { stopTimer(); onEnd("time"); }
  };
  timer = { id: setInterval(tick, 200), started: performance.now() };
  tick();
}
function stopTimer() {
  if (!timer) return 0;
  clearInterval(timer.id);
  const used = (performance.now() - timer.started) / 1000;
  timer = null;
  return Math.round(used);
}

// ---------------------------------------------------------------- STAGE 1: spot the problems
async function stage1() {
  setStageDots(1);
  setSide("Spot the problems", "Tap every place where the flyer looks wrong. Careful: wrong taps cost points!");
  drawFlyer(S.work);
  gsap.from("#desk", { rotationX: 50, transformPerspective: 1200, y: 120, opacity: 0, duration: 0.8, ease: "power3.out", clearProps: "transform" });
  await stageCard(1, "Spot the Problem", "Glitch hid 4 design mistakes in this flyer. Tap each one you can find.", "I hid 4 mistakes. You'll never find them all!");

  const problems = S.work.variant.problems.map((p) => ({ ...p, found: false, hinted: false }));
  const st = { found: 0, wrong: 0, hinted: false, done: false };
  const body = $("sideBody");
  body.innerHTML = `<div class="counter" id="counter">${problems.map((_, i) => `<span>${i + 1}</span>`).join("")}</div>
    <p class="muted small" id="wrongText">Wrong taps: 0</p>
    <ul class="found-list" id="foundList"></ul>
    <button class="hint-btn" id="hintBtn">💡 Use my one hint</button>`;
  const PAD = 16;
  const inside = (p, pt) => pt.x >= p.rect[0] - PAD && pt.x <= p.rect[0] + p.rect[2] + PAD && pt.y >= p.rect[1] - PAD && pt.y <= p.rect[1] + p.rect[3] + PAD;
  const centreDist = (p, pt) => Math.hypot(p.rect[0] + p.rect[2] / 2 - pt.x, p.rect[1] + p.rect[3] / 2 - pt.y);

  const markProblem = (p, cls = "mark") => {
    const m = document.createElement("div");
    m.className = cls;
    Object.assign(m.style, { left: p.rect[0] + "px", top: p.rect[1] + "px", width: p.rect[2] + "px", height: p.rect[3] + "px" });
    if (cls === "mark") m.innerHTML = `<b>${st.found}</b>`;
    S.flyerEl.appendChild(m);
    gsap.from(m, { scale: 1.3, opacity: 0, duration: 0.35, ease: "back.out(2)" });
    return m;
  };

  const finish = (reason) => {
    if (st.done) return;
    st.done = true;
    S.times.spot = stopTimer();
    S.flyerEl.removeEventListener("pointerdown", onTap);
    S.spot = { found: st.found, wrong: st.wrong, hinted: st.hinted, score: spotScore(st), total: problems.length };
    const missed = problems.filter((p) => !p.found);
    if (missed.length) {
      missed.forEach((p) => { const m = markProblem(p, "hintglow"); m.title = p.label; });
      toast(`Missed: ${missed.map((p) => p.label.toLowerCase()).join("; ")}`, true);
      setTimeout(stage2, 2600);
    } else {
      sfx.fanfare();
      toast("All 4 problems found! 🎉");
      setTimeout(stage2, 1400);
    }
  };

  const onTap = (e) => {
    if (st.done) return;
    const pt = toFlyer(e);
    const hits = problems.filter((p) => !p.found && inside(p, pt)).sort((a, b) => centreDist(a, pt) - centreDist(b, pt));
    if (!hits.length && problems.some((p) => p.found && inside(p, pt))) return; // tapped a problem already found: no penalty
    if (hits.length) {
      const p = hits[0];
      p.found = true;
      st.found++;
      markProblem(p);
      $("counter").children[st.found - 1].classList.add("hit");
      const li = document.createElement("li");
      li.textContent = "✓ " + p.label;
      $("foundList").appendChild(li);
      burst(e.clientX, e.clientY);
      sfx.chime();
      glitchReact("sulk", pick(LINES.hit));
      if (st.found === problems.length) setTimeout(() => finish("all"), 700);
    } else {
      st.wrong++;
      $("wrongText").textContent = `Wrong taps: ${st.wrong}`;
      const m = document.createElement("div");
      m.className = "miss";
      m.style.left = pt.x + "px";
      m.style.top = pt.y + "px";
      S.flyerEl.appendChild(m);
      gsap.fromTo(m, { scale: 0.3, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.9, ease: "power2.out", onComplete: () => m.remove() });
      sfx.wrong();
      glitchReact("giggle", pick(LINES.miss));
      if (navigator.vibrate) navigator.vibrate(60);
    }
  };
  S.flyerEl.addEventListener("pointerdown", onTap);
  $("hintBtn").addEventListener("click", () => {
    const p = problems.find((x) => !x.found);
    if (!p || st.hinted) return;
    st.hinted = true;
    p.hinted = true;
    $("hintBtn").disabled = true;
    $("hintBtn").textContent = "💡 Hint used";
    const g = markProblem(p, "hintglow");
    setTimeout(() => g.remove(), 2200);
    sfx.sparkle();
  });
  glitchReact("grin", "Find my mistakes… if you can!");
  startTimer(CFG.STAGE_TIME[1], finish);
}

// ---------------------------------------------------------------- STAGE 2: fix the layout
async function stage2() {
  setStageDots(2);
  setSide("Fix the layout", "Drag the pieces into place. Watch the checklist turn green.");
  S.work = cloneState(S.broken);
  const f = drawFlyer(S.work, true);
  const hasClutter = S.work.stickers.length > 0;
  await stageCard(2, "Fix the Layout",
    `Drag the heading, picture and text into a neat, readable flyer.${hasClutter ? " Drag Glitch's random stickers off the flyer to remove them." : ""}`,
    "Try to fix my masterpiece. Hehehe!");

  const items = [
    ["heading", "Heading stands out at the top"],
    ["overlap", "Nothing overlapping or off the edge"],
    ["align", "Everything lined up"],
    ["spacing", "Even space between sections"],
  ];
  if (hasClutter) items.push(["clutter", "Glitch's stickers cleared"]);
  $("sideBody").innerHTML = `<ul class="checklist" id="checklist">${items.map(([k, t]) => `<li data-k="${k}">${t}</li>`).join("")}</ul>
    <p class="muted small">Tip: the pink line appears when something is centred.</p>`;
  const guideV = Object.assign(document.createElement("div"), { className: "guide v" });
  const guideL = Object.assign(document.createElement("div"), { className: "guide v" });
  f.append(guideV, guideL);
  guideV.style.left = W / 2 - 1 + "px";

  const passed = new Set();
  const updateChecklist = () => {
    const r = layoutRules(S.work);
    const spacingOnly = Math.min(10, r.spacing + r.clutterLeft * 2);
    const state = { heading: r.heading >= 9, overlap: r.overlap >= 9, align: r.align >= 9, spacing: spacingOnly >= 9, clutter: r.clutterLeft === 0 };
    document.querySelectorAll("#checklist li").forEach((li) => {
      const k = li.dataset.k;
      const ok = state[k];
      if (ok && !passed.has(k)) {
        passed.add(k);
        gsap.fromTo(li, { scale: 1.06 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
        sfx.chime();
        if (Math.random() < 0.5) glitchReact("sulk", pick(LINES.fix));
      }
      if (!ok) passed.delete(k);
      li.classList.toggle("ok", ok);
    });
    return r;
  };
  updateChecklist();

  let drag = null;
  const startDrag = (e) => {
    // When pieces overlap, grab the one whose centre is closest to the finger,
    // so a picture under a heading's empty space can still be picked up.
    const under = [...new Set(document.elementsFromPoint(e.clientX, e.clientY).map((n) => n.closest && n.closest(".el.movable")).filter(Boolean))];
    if (!under.length) return;
    const dist = (n) => { const r = n.getBoundingClientRect(); return Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY) / Math.sqrt(r.width * r.height); };
    const el = under.sort((a, b) => dist(a) - dist(b))[0];
    e.preventDefault();
    const id = el.dataset.id;
    const isSticker = !!el.dataset.sticker;
    const model = isSticker ? S.work.stickers.find((s) => s.id === id) : S.work.els[id];
    const pt = toFlyer(e);
    drag = { el, model, isSticker, dx: pt.x - model.x, dy: pt.y - model.y, pointer: e.pointerId };
    try { el.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    el.classList.add("dragging");
    sfx.pop();
  };
  const moveDrag = (e) => {
    if (!drag || e.pointerId !== drag.pointer) return;
    const pt = toFlyer(e);
    const m = drag.model;
    let x = pt.x - drag.dx, y = pt.y - drag.dy;
    let snappedC = false, snappedL = null;
    if (!drag.isSticker) {
      x = Math.max(-m.w * 0.25, Math.min(W - m.w * 0.75, x));
      y = Math.max(-m.h * 0.25, Math.min(H - m.h * 0.75, y));
      if (Math.abs(x + m.w / 2 - W / 2) < 12) { x = W / 2 - m.w / 2; snappedC = true; }
      else {
        for (const id of CONTENT_IDS) {
          const o = S.work.els[id];
          if (o !== m && Math.abs(o.x - x) < 8) { x = o.x; snappedL = x; break; }
        }
      }
    }
    m.x = Math.round(x);
    m.y = Math.round(y);
    drag.el.style.left = m.x + "px";
    drag.el.style.top = m.y + "px";
    guideV.classList.toggle("on", snappedC);
    guideL.classList.toggle("on", snappedL !== null);
    if (snappedL !== null) guideL.style.left = snappedL - 1 + "px";
  };
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.pointer) return;
    const { el, model, isSticker } = drag;
    el.classList.remove("dragging");
    guideV.classList.remove("on");
    guideL.classList.remove("on");
    if (isSticker) {
      const cx = model.x + model.w / 2, cy = model.y + model.h / 2;
      if (cx < 10 || cx > W - 10 || cy < 10 || cy > H - 10) {
        S.work.stickers = S.work.stickers.filter((s) => s !== model);
        const sp = flyerToScreen(Math.max(10, Math.min(W - 10, cx)), Math.max(10, Math.min(H - 10, cy)));
        burst(sp.x, sp.y, ["💨", "✦", "❄"], 10);
        gsap.to(el, { scale: 0, opacity: 0, duration: 0.25, onComplete: () => el.remove() });
        sfx.whoosh();
        glitchReact("sulk", pick(LINES.sticker));
      } else sfx.snap();
    } else sfx.snap();
    drag = null;
    updateChecklist();
  };
  f.addEventListener("pointerdown", startDrag);
  f.addEventListener("pointermove", moveDrag);
  f.addEventListener("pointerup", endDrag);
  f.addEventListener("pointercancel", endDrag);

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    S.times.fix = stopTimer();
    f.classList.remove("draggable");
    f.removeEventListener("pointerdown", startDrag);
    S.rules = layoutRules(S.work);
    S.rules.score = Math.round((S.rules.heading + S.rules.overlap + S.rules.align + S.rules.spacing) * 10) / 10;
    sfx.sparkle();
    setTimeout(stage3, 600);
  };
  actionButton("Done fixing", "btn-gold", finish);
  glitchReact("grin", "Go on then, move things around…");
  startTimer(CFG.STAGE_TIME[2], finish);
}

// ---------------------------------------------------------------- STAGE 3: the final touch
async function stage3() {
  setStageDots(3);
  setSide("The final touch", "Make it easy to read and nice to look at.");
  drawFlyer(S.work);
  await stageCard(3, "The Final Touch", "Three quick choices: colours, background and line spacing. Each one changes your flyer live.", "You'll never pick good colours! Hehe.");

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    S.times.final = stopTimer();
    S.touches = {
      palette: S.choices.palette, background: S.choices.background, lineHeight: S.choices.lineHeight,
      colour: paletteScore(S.choices.palette), bg: backgroundScore(S.choices.background), lines: lineSpacingScore(S.choices.lineHeight),
    };
    S.touches.score = S.touches.colour + S.touches.bg + S.touches.lines;
    finishGame();
  };

  const rounds = [roundColour, roundBackground, roundSpacing];
  let r = 0;
  const next = () => { r++; if (r < rounds.length) rounds[r](next, r); else finish(); };
  rounds[0](next, 0);
  glitchReact("grin", "Colours are my favourite thing to mess up!");
  startTimer(CFG.STAGE_TIME[3], finish);
}

function roundShell(index, title, text) {
  $("sideBody").innerHTML = `<p class="round-label">Round ${index + 1} of 3</p><h3 class="round-title">${title}</h3><p class="muted small">${text}</p><div id="roundBody"></div>`;
  $("sideActions").innerHTML = "";
  gsap.from("#sideBody", { x: 30, opacity: 0, duration: 0.35 });
  return $("roundBody");
}
function refreshFlyer() {
  S.flyerEl = renderFlyer($("flyerHolder"), S.work);
  S.flyerEl.style.transform = `scale(${S.scale})`;
}

function roundColour(next, i) {
  const body = roundShell(i, "Choose a colour combination", "Tap a set to try it on your flyer. Pick the one that is easiest to read.");
  body.innerHTML = `<div class="chips">${PALETTE_CHOICES.map((k) => {
    const p = PALETTES[k];
    return `<button class="chip" data-k="${k}"><span class="swatch"><i style="background:${p.bg}"></i><i style="background:${p.heading}"></i><i style="background:${p.text}"></i><i style="background:${p.tagBg}"></i></span>${p.name}</button>`;
  }).join("")}</div>
  <div style="margin-top:14px"><div class="meter-row"><span>Readability</span><span id="readLabel">Not chosen</span></div><div class="meter"><i id="readBar"></i></div></div>`;
  const ok = actionButton("Use these colours", "btn-gold", () => { sfx.chime(); next(); });
  ok.disabled = true;
  body.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
    body.querySelectorAll(".chip").forEach((x) => x.classList.toggle("sel", x === c));
    S.choices.palette = c.dataset.k;
    S.work.palette = c.dataset.k;
    refreshFlyer();
    const rd = readability(c.dataset.k);
    const bar = $("readBar");
    bar.style.width = Math.max(6, rd.pct) + "%";
    bar.style.background = rd.ratio >= 7 ? "var(--good)" : rd.ratio >= 4.5 ? "#9be15d" : rd.ratio >= 3 ? "var(--gold)" : "var(--bad)";
    $("readLabel").textContent = rd.ratio >= 7 ? "Easy to read" : rd.ratio >= 4.5 ? "Good" : rd.ratio >= 3 ? "A bit hard" : "Hard to read";
    ok.disabled = false;
    sfx.pop();
  }));
}

function roundBackground(next, i) {
  const body = roundShell(i, "Pick a background", "The background should help the text stand out, not fight it.");
  body.innerHTML = `<div class="chips">${BACKGROUND_CHOICES.map((k) => {
    const preview = bgCSS({ ...S.work, background: k }, PALETTES[S.work.palette === "glitch" ? "snow" : S.work.palette]);
    return `<button class="chip" data-k="${k}"><span class="bgprev" style="background:${preview}"></span>${BACKGROUNDS[k].name}</button>`;
  }).join("")}</div>`;
  const ok = actionButton("Use this background", "btn-gold", () => { sfx.chime(); next(); });
  ok.disabled = true;
  body.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
    body.querySelectorAll(".chip").forEach((x) => x.classList.toggle("sel", x === c));
    S.choices.background = c.dataset.k;
    S.work.background = c.dataset.k;
    refreshFlyer();
    ok.disabled = false;
    sfx.pop();
  }));
}

function roundSpacing(next, i) {
  const body = roundShell(i, "Set the line spacing", "Slide to change the space between the lines of the event details.");
  body.innerHTML = `<label class="meter-row" for="lhSlider"><span>Line spacing</span><span id="lhVal">${S.choices.lineHeight.toFixed(2)}</span></label>
    <input type="range" class="slider" id="lhSlider" min="0.8" max="2" step="0.05" value="${S.choices.lineHeight}">
    <p class="muted small" style="display:flex;justify-content:space-between"><span>Squashed</span><span>Spread out</span></p>`;
  actionButton("Finish my flyer ✨", "btn-gold", () => { sfx.chime(); next(); });
  $("lhSlider").addEventListener("input", (e) => {
    const v = Number(e.target.value);
    S.choices.lineHeight = v;
    S.work.lineHeight = v;
    $("lhVal").textContent = v.toFixed(2);
    const det = S.flyerEl.querySelector(".el.details");
    if (det) det.style.setProperty("--lh", v);
  });
}

// ---------------------------------------------------------------- results
async function finishGame() {
  stopTimer();
  const total = Math.round(S.spot.score + S.rules.score + S.touches.score);
  const cats = {
    spot: S.spot.score / 30, heading: S.rules.heading / 10, overlap: S.rules.overlap / 10, align: S.rules.align / 10,
    spacing: S.rules.spacing / 10, colour: S.touches.colour / 10, background: S.touches.bg / 10, lines: S.touches.lines / 10,
  };
  const corrections = S.spot.found
    + ["heading", "overlap", "align", "spacing"].filter((k) => S.rules[k] >= 9).length
    + [S.touches.colour, S.touches.bg, S.touches.lines].filter((v) => v >= 8).length;
  const fb = feedback(cats);
  const lvl = level(total);
  const seconds = Math.round((performance.now() - S.startedAt) / 1000);
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const record = {
    timestamp: new Date().toISOString(),
    name: S.player.name,
    quizmasId: S.player.id,
    game: CFG.GAME_ID,
    gameName: CFG.GAME_NAME,
    attempt: S.attempt,
    official: S.official,
    score: total,
    maxScore: 100,
    level: lvl,
    spotScore: S.spot.score,
    layoutScore: S.rules.score,
    finalTouchScore: S.touches.score,
    problemsFound: `${S.spot.found}/${S.spot.total}`,
    wrongTaps: S.spot.wrong,
    hintUsed: S.spot.hinted,
    corrections: `${corrections}/11`,
    flyerVersion: S.work.variant.key,
    timeSpot: S.times.spot, timeFix: S.times.fix, timeFinal: S.times.final, totalSeconds: seconds,
    device: coarse ? (Math.min(screen.width, screen.height) < 700 ? "phone" : "tablet") : "computer",
    strength: fb.good, improve: fb.work,
  };
  S.result = record;
  showResults(record, fb, corrections);
  const status = await saveResult(record);
  $("saveStatus").textContent = !S.official
    ? (status === "sent" ? "Practice round saved (not your official score)." : "Practice round recorded on this device.")
    : status === "sent" ? "✓ Official score saved to Quizmas." : status === "queued" ? "✓ Score saved on this device. It will be sent to Quizmas automatically." : "✓ Saved on this device. It will upload when you're back online.";
}

function showResults(rec, fb, corrections) {
  show("results");
  $("resultsName").textContent = rec.score >= 75 ? `Brilliant work, ${rec.name.split(" ")[0]}!` : rec.score >= 55 ? `Nice job, ${rec.name.split(" ")[0]}!` : `Good effort, ${rec.name.split(" ")[0]}!`;
  $("levelText").textContent = rec.level;
  $("attemptTag").textContent = S.official ? "OFFICIAL SCORE" : `PRACTICE ROUND ${S.attempt - 1} · NOT COUNTED`;
  $("breakdown").innerHTML = [
    ["Spot the problems", rec.spotScore, 30, `${rec.problemsFound} found${rec.wrongTaps ? `, ${rec.wrongTaps} wrong tap${rec.wrongTaps > 1 ? "s" : ""}` : ""}`],
    ["Fix the layout", rec.layoutScore, 40, ""],
    ["Final touches", rec.finalTouchScore, 30, ""],
  ].map(([t, v, m, note]) => `<div class="bd-row"><span>${t}${note ? ` <small class="muted">(${note})</small>` : ""}</span><b>${v} / ${m}</b><div class="bd-bar"><i data-w="${(v / m) * 100}"></i></div></div>`).join("")
    + `<p class="muted small">Corrections completed: <b>${corrections} of 11</b> · Time: ${Math.floor(rec.totalSeconds / 60)}m ${rec.totalSeconds % 60}s</p>`;
  $("feedback").innerHTML = `<div class="fb good"><span>🌟</span><div>${fb.good}</div></div><div class="fb work"><span>🎯</span><div>${fb.work}</div></div>`;

  // Finished flyer on the 3D noticeboard.
  const bf = $("boardFlyer");
  const finalEl = renderFlyer(bf, S.work);
  requestAnimationFrame(() => fitInside(bf, finalEl));
  setupBeforeAfter();

  const tl = gsap.timeline();
  tl.from("#board", { rotationX: 70, y: -260, opacity: 0, duration: 0.9, ease: "power3.out" })
    .from("#boardFlyer", { rotationX: -95, opacity: 0, duration: 0.8, ease: "back.out(1.4)", onStart: () => sfx.whoosh() }, "-=0.3")
    .from(".pin", { scale: 0, duration: 0.3, stagger: 0.12, ease: "back.out(3)", onStart: () => sfx.snap() })
    .from("#resultsPanel", { x: 60, opacity: 0, duration: 0.6 }, "-=0.6")
    .add(() => countUp(rec.score), "-=0.2");
  if (CFG.SHOW_GLITCH) {
    setTimeout(() => toast(rec.score >= 75 ? "Glitch: Ugh… it's PERFECT. You win this time!" : "Glitch: Hehe, my mess survived a bit. Come back stronger!"), 2600);
  }
}

function countUp(score) {
  const num = $("scoreNum"), ring = $("scoreRing");
  const o = { v: 0 };
  let last = -1;
  gsap.to(o, {
    v: score, duration: 1.8, ease: "power2.out",
    onUpdate: () => {
      const v = Math.round(o.v);
      num.textContent = v;
      ring.style.strokeDashoffset = String(326.7 * (1 - o.v / 100));
      if (v !== last && v % 3 === 0) sfx.count();
      last = v;
    },
    onComplete: () => {
      document.querySelectorAll(".bd-bar i").forEach((i) => { i.style.width = i.dataset.w + "%"; });
      gsap.from("#levelText", { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(3)" });
      if (score >= 55) { confetti($("confetti")); sfx.fanfare(); } else sfx.chime();
    },
  });
}

function setupBeforeAfter() {
  const frame = $("baFrame");
  const before = renderFlyer($("baBefore"), S.broken);
  const after = renderFlyer($("baAfter"), S.work);
  const fit = () => { fitInside($("baBefore"), before); fitInside($("baAfter"), after); };
  requestAnimationFrame(fit);
  const set = (clientX) => {
    const r = frame.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    $("baBefore").style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    $("baHandle").style.left = pct + "%";
  };
  let dragging = false;
  frame.onpointerdown = (e) => { dragging = true; try { frame.setPointerCapture(e.pointerId); } catch { /* ignore */ } set(e.clientX); };
  frame.onpointermove = (e) => { if (dragging) set(e.clientX); };
  frame.onpointerup = () => { dragging = false; };
  window.addEventListener("resize", fit);
}

async function downloadBadge() {
  const r = S.result;
  const blob = await makeBadge({
    name: r.name, id: r.quizmasId, score: r.score, level: r.level, gameName: CFG.GAME_NAME,
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), official: r.official,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Design-Badge-${r.name.replace(/[^a-z0-9]+/gi, "-")}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  sfx.sparkle();
}

// ---------------------------------------------------------------- wiring
function boot() {
  startSnow($("snow"));
  mountGlitch($("glitchStory"));
  mountGlitch($("glitchMini"));
  setupEntry();
  $("startBtn").addEventListener("click", () => {
    audio.unlock();
    sfx.pop();
    show("entry");
    setTimeout(() => $("playerName").focus(), 450);
    if (gift) setTimeout(() => { gift.destroy(); gift = null; }, 600);
  });
  $("beginBtn").addEventListener("click", () => { storyRun++; sfx.pop(); startRound(); });
  $("skipStory").addEventListener("click", () => { storyRun++; startRound(); });
  $("againBtn").addEventListener("click", () => { sfx.pop(); startRound(); });
  $("badgeBtn").addEventListener("click", downloadBadge);
  $("muteBtn").addEventListener("click", () => {
    const m = !audio.isMuted();
    audio.setMuted(m);
    $("muteBtn").firstChild.textContent = m ? "🔇" : "🔊";
    $("muteBtn").setAttribute("aria-label", m ? "Sound off" : "Sound on");
  });
  window.addEventListener("resize", () => {
    if (current === "game") layoutFlyer();
    if (current === "results") {
      const bf = $("boardFlyer"), el = bf.querySelector(".flyer");
      if (el) fitInside(bf, el);
    }
  });
  if (window.ResizeObserver) new ResizeObserver(() => { if (current === "game") layoutFlyer(); }).observe($("flyerArea"));
  flush();
  runLoader().then(showGift);
}
boot();
