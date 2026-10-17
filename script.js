/* =========================================================
   Asif Ahmed portfolio: script.js
   Plain JavaScript, no libraries. Each block is independent,
   so if you delete one, the others keep working.
   ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- 1. Footer year ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- 2. Navbar gets a blurred background after scrolling ---------- */
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- 3. Mouse glow ---------- */
if (!reduceMotion) {
  window.addEventListener("pointermove", (e) => {
    document.documentElement.style.setProperty("--mx", e.clientX + "px");
    document.documentElement.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });
}

/* ---------- 4. Typing effect in the hero ---------- */
const phrases = [
  "voice bots that listen and talk back.",
  "NLP for real conversations.",
  "fine-tuning LLMs with LoRA.",
  "text-to-speech that sounds natural.",
  "quantized Bangla language models."
];
const typed = $("#typed");
let pi = 0, ci = 0, deleting = false;
function type() {
  const word = phrases[pi];
  ci += deleting ? -1 : 1;
  typed.textContent = word.slice(0, ci);
  let wait = deleting ? 28 : 55;
  if (!deleting && ci === word.length) { wait = 1600; deleting = true; }
  else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; wait = 350; }
  setTimeout(type, wait);
}
if (reduceMotion) typed.textContent = phrases[0]; else type();

/* ---------- 5. Hero waveform (canvas) ---------- */
const canvas = $("#wave");
const ctx = canvas.getContext("2d");
let W = 0, H = 0, mouseX = 0.5, t = 0;
function sizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function drawWave() {
  ctx.clearRect(0, 0, W, H);
  const bars = Math.max(24, Math.floor(W / 14));
  const gap = W / bars;
  for (let i = 0; i < bars; i++) {
    const x = i * gap + gap / 2;
    const nx = i / bars;
    // louder near the mouse, like a voice level meter
    const near = Math.exp(-Math.pow((nx - mouseX) * 4, 2));
    const level = 0.25 + 0.35 * Math.sin(t * 1.6 + i * 0.35) * Math.sin(t * 0.7 + i * 0.12) + 0.45 * near;
    const h = Math.max(4, Math.abs(level) * H * 0.9);
    ctx.fillStyle = i % 2 ? "#5eead4" : "#ff8a4c";
    ctx.globalAlpha = 0.35 + 0.65 * near;
    ctx.beginPath();
    ctx.roundRect(x - 2, H - h, 4, h, 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function loop() { t += 0.02; drawWave(); requestAnimationFrame(loop); }
sizeCanvas();
window.addEventListener("resize", sizeCanvas);
window.addEventListener("pointermove", (e) => { mouseX = e.clientX / window.innerWidth; }, { passive: true });
if (reduceMotion) { t = 2; drawWave(); } else loop();

/* ---------- 6. Scroll reveal + number counters ---------- */
const revealEls = $$(".reveal");
// Only hide elements that start below the visible screen
revealEls.forEach((el) => {
  if (!reduceMotion && el.getBoundingClientRect().top > window.innerHeight) el.classList.add("pre");
});
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.dec || "0", 10);
  if (reduceMotion) { el.textContent = target.toFixed(dec); return; }
  const start = performance.now(), dur = 1400;
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(dec);
    if (p < 1) requestAnimationFrame(step);
  })(start);
}
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    // also reveal items the visitor scrolled past very quickly
    if (!en.isIntersecting && en.boundingClientRect.top >= 0) return;
    en.target.classList.add("in");
    $$("[data-count]", en.target).forEach(countUp);
    io.unobserve(en.target);
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => io.observe(el));

/* ---------- 7. Voice bot pipeline ---------- */
const stages = [
  ["Microphone", "Captures your voice as raw audio, usually in small chunks so the bot can start working before you finish speaking."],
  ["ASR (speech recognition)", "Automatic speech recognition turns the audio into text. Accents, background noise and the language being spoken all affect accuracy."],
  ["NLP + LLM", "The text is analysed to find what the user wants, then a language model writes the reply. Fine-tuning with LoRA adapts the model to the bot's domain without retraining every weight."],
  ["TTS (text-to-speech)", "The reply text is turned back into audio. Good TTS gets pronunciation, pacing and tone right, and starts playing quickly so the conversation feels natural."],
  ["Speaker", "The audio plays back to the user. Total delay from the end of speech to the start of the reply is the number that decides if a voice bot feels alive."]
];
const nodes = $$(".node");
const info = $("#pipeInfo");
let current = 0, auto = null;
function showStage(i) {
  current = i;
  nodes.forEach((n, k) => n.classList.toggle("active", k === i));
  info.innerHTML = "<strong>" + stages[i][0] + ".</strong> " + stages[i][1];
}
function startAuto() {
  if (reduceMotion) return;
  stopAuto();
  auto = setInterval(() => showStage((current + 1) % stages.length), 3200);
}
function stopAuto() { clearInterval(auto); }
nodes.forEach((n, i) => n.addEventListener("click", () => { showStage(i); startAuto(); }));
showStage(0);
startAuto();

/* ---------- 8. Demo chat bot (scripted answers) ---------- */
const answers = {
  "Who are you?": "I'm Asif Ahmed, a CSE student at AIUB (Data Science, AI & ML) and a software development intern at Reve Systems. I graduate in 2026 with a 3.85 CGPA.",
  "What are you building?": "At Reve Systems I work on a voice bot system. My part touches NLP, fine-tuning a language model with LoRA, and text-to-speech.",
  "Explain LoRA": "LoRA freezes the original model weights and trains two small matrices per layer instead. That means far fewer trainable parameters, less memory and faster training. Try the sliders in the AI lab below.",
  "Your research?": "My thesis studies script integrity, performance and energy efficiency in quantized Bangla large language models. I also co-authored two papers that are under review.",
  "How can I contact you?": "Email rockyasif825@gmail.com, or use the GitHub and LinkedIn buttons in the contact section at the bottom of this page."
};
const log = $("#chatLog");
const chipBox = $("#chips");
const speakToggle = $("#speakToggle");

function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = "msg msg--" + who;
  d.textContent = text;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
  return d;
}
function speak(text) {
  try {
    if (!speakToggle.checked || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  } catch (e) { /* speech not available: ignore */ }
}
function ask(q) {
  addMsg(q, "me");
  const dots = addMsg("thinking…", "bot");
  dots.classList.add("msg--typing");
  setTimeout(() => {
    dots.classList.remove("msg--typing");
    dots.textContent = answers[q];
    log.scrollTop = log.scrollHeight;
    speak(answers[q]);
  }, reduceMotion ? 0 : 700);
}
Object.keys(answers).forEach((q) => {
  const b = document.createElement("button");
  b.textContent = q;
  b.addEventListener("click", () => ask(q));
  chipBox.appendChild(b);
});
addMsg("Hi! Pick a question below and I'll answer for Asif.", "bot");
speakToggle.addEventListener("change", () => { if (!speakToggle.checked) try { speechSynthesis.cancel(); } catch (e) {} });

/* ---------- 9. LoRA calculator ---------- */
const dims = [768, 1024, 2048, 4096, 8192];
const dimEl = $("#dim"), rankEl = $("#rank");
const fmt = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n);
function updateLora() {
  const d = dims[+dimEl.value];
  const r = +rankEl.value;
  const full = d * d;
  const lora = 2 * d * r;
  $("#dimOut").textContent = d;
  $("#rankOut").textContent = r;
  $("#valFull").textContent = fmt(full);
  $("#valLora").textContent = fmt(lora);
  $("#barLora").style.width = Math.max(1, (lora / full) * 100) + "%";
  const pct = (lora / full) * 100;
  $("#pct").textContent = (pct < 10 ? pct.toFixed(2) : pct.toFixed(1)) + "%";
}
dimEl.addEventListener("input", updateLora);
rankEl.addEventListener("input", updateLora);
updateLora();

/* ---------- 10. Quantization memory calculator ---------- */
let sizeB = 1, bits = 16;
function updateMem() {
  const gb = (sizeB * 1e9 * bits) / 8 / 1e9;       // billions of params x bytes
  const maxGb = (13 * 1e9 * 16) / 8 / 1e9;          // biggest case = 26 GB
  $("#memVal").textContent = (gb < 10 ? gb.toFixed(1) : Math.round(gb)) + " GB";
  $("#memBar").style.width = Math.max(3, (gb / maxGb) * 100) + "%";
}
function segment(id, onPick) {
  const box = $(id);
  $$("button", box).forEach((b) => b.addEventListener("click", () => {
    $$("button", box).forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    onPick(+b.dataset.v);
    updateMem();
  }));
}
segment("#sizeSeg", (v) => (sizeB = v));
segment("#bitSeg", (v) => (bits = v));
updateMem();

/* ---------- 11. Copy email button ---------- */
const toast = $("#toast");
$("#copyMail").addEventListener("click", async (e) => {
  const mail = e.currentTarget.dataset.mail;
  try {
    await navigator.clipboard.writeText(mail);
    toast.textContent = "Copied " + mail;
  } catch (err) {
    toast.textContent = "Copy failed. My email is " + mail;
  }
  setTimeout(() => (toast.textContent = ""), 3000);
});
