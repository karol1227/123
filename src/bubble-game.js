const WELCOME_TEXT =
  "屏幕上会缓缓飘起半透明泡泡，轻轻点破它们就好。不用着急，不用思考——只是让心事随泡泡慢慢变轻。";

const END_TEXT = "你今天已经很棒了，放下烦恼，好好爱自己";

const WIND_DOWN_MS = 60000;
const END_AFTER_WIND_DOWN_MS = 10000;
const SESSION_MS = WIND_DOWN_MS + END_AFTER_WIND_DOWN_MS;
const SPAWN_BASE_MS = 900;
const MAX_BUBBLES = 14;

const BUBBLE_COLORS = [
  "rgba(232, 180, 188, 0.35)",
  "rgba(201, 184, 232, 0.32)",
  "rgba(244, 212, 168, 0.28)",
  "rgba(232, 168, 124, 0.25)",
];

let overlay = null;
let arena = null;
let audioCtx = null;
let sessionStart = 0;
let spawnTimer = null;
let tickTimer = null;
let running = false;
let activeBubbles = 0;
let poppedCount = 0;
let spawnInterval = SPAWN_BASE_MS;

function createOverlay() {
  const el = document.createElement("div");
  el.className = "bubble-overlay";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "心事泡泡小游戏");
  el.innerHTML = `
    <div class="bubble-overlay-bg" aria-hidden="true"></div>
    <button class="bubble-overlay-close" type="button" aria-label="关闭">
      <span aria-hidden="true">×</span>
    </button>

    <div class="bubble-screen bubble-screen--welcome">
      <div class="bubble-welcome-inner">
        <p class="bubble-welcome-eyebrow">小游戏 · Heart Bubbles</p>
        <h3 class="bubble-welcome-title">心事泡泡</h3>
        <p class="bubble-welcome-text">${WELCOME_TEXT}</p>
        <p class="bubble-welcome-hint">约 1 分钟 · 轻轻点破即可</p>
        <button class="btn btn-primary bubble-start-btn" type="button">开始轻玩</button>
      </div>
    </div>

    <div class="bubble-screen bubble-screen--play" hidden>
      <p class="bubble-play-hint">轻轻点破飘起的心事</p>
      <div class="bubble-arena" aria-label="泡泡游戏区域"></div>
      <p class="bubble-play-count" aria-live="polite"></p>
    </div>

    <div class="bubble-screen bubble-screen--end" hidden>
      <div class="bubble-end-inner">
        <p class="bubble-end-glow" aria-hidden="true">◌</p>
        <p class="bubble-end-text">${END_TEXT}</p>
        <p class="bubble-end-sub">你点破了 <span class="bubble-end-num">0</span> 个泡泡</p>
        <button class="btn btn-primary bubble-restart-btn" type="button">再玩一次</button>
        <button class="btn btn-ghost bubble-finish-btn" type="button">结束体验</button>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  return el;
}

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playPopSound(pitch = 1) {
  ensureAudio();
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const base = 520 + Math.random() * 180;
  osc.frequency.setValueAtTime(base * pitch, t);
  osc.frequency.exponentialRampToValueAtTime(base * pitch * 0.4, t + 0.12);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.06, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  osc.start(t);
  osc.stop(t + 0.2);
}

function spawnHalo(x, y, size) {
  const halo = document.createElement("div");
  halo.className = "bubble-pop-halo";
  halo.style.left = `${x}px`;
  halo.style.top = `${y}px`;
  halo.style.width = `${size * 2.2}px`;
  halo.style.height = `${size * 2.2}px`;
  arena.appendChild(halo);
  halo.addEventListener("animationend", () => halo.remove());
}

function getSpawnDelay() {
  const elapsed = Date.now() - sessionStart;
  if (elapsed >= SESSION_MS - 2000) return null;

  if (elapsed < WIND_DOWN_MS) return spawnInterval;

  const progress = (elapsed - WIND_DOWN_MS) / END_AFTER_WIND_DOWN_MS;
  if (progress >= 0.5) return null;
  const factor = 1 + progress * 8;
  if (Math.random() > 1 / factor) return null;
  return spawnInterval * factor;
}

function spawnBubble() {
  if (!running || !arena) return;

  const elapsed = Date.now() - sessionStart;
  if (elapsed >= SESSION_MS) {
    finishSession();
    return;
  }

  const maxAllowed =
    elapsed < WIND_DOWN_MS
      ? MAX_BUBBLES
      : Math.max(1, Math.round(MAX_BUBBLES * (1 - (elapsed - WIND_DOWN_MS) / END_AFTER_WIND_DOWN_MS)));

  if (activeBubbles >= maxAllowed) {
    scheduleSpawn();
    return;
  }

  const rect = arena.getBoundingClientRect();
  const size = 28 + Math.random() * 44;
  const x = size + Math.random() * (rect.width - size * 2);
  const duration = 9 + Math.random() * 7;
  const drift = (Math.random() - 0.5) * 60;
  const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

  const bubble = document.createElement("button");
  bubble.type = "button";
  bubble.className = "bubble-item";
  bubble.setAttribute("aria-label", "戳破泡泡");
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${x}px`;
  bubble.style.bottom = `-${size}px`;
  bubble.style.setProperty("--bubble-color", color);
  bubble.style.setProperty("--bubble-duration", `${duration}s`);
  bubble.style.setProperty("--bubble-drift", `${drift}px`);

  let popped = false;

  const onFloatEnd = () => {
    if (popped) return;
    bubble.remove();
    activeBubbles = Math.max(0, activeBubbles - 1);
    checkEndCondition();
  };

  bubble.addEventListener("animationend", onFloatEnd);

  bubble.addEventListener("click", (e) => {
    e.stopPropagation();
    if (popped) return;
    popped = true;
    bubble.removeEventListener("animationend", onFloatEnd);

    const bRect = bubble.getBoundingClientRect();
    const aRect = arena.getBoundingClientRect();
    const cx = bRect.left - aRect.left + bRect.width / 2;
    const cy = bRect.top - aRect.top + bRect.height / 2;

    bubble.classList.add("is-popping");
    spawnHalo(cx, cy, size / 2);
    playPopSound(0.9 + Math.random() * 0.3);
    poppedCount++;
    activeBubbles = Math.max(0, activeBubbles - 1);
    updateCount();
    checkEndCondition();

    setTimeout(() => bubble.remove(), 380);
  });

  arena.appendChild(bubble);
  activeBubbles++;
  scheduleSpawn();
}

function scheduleSpawn() {
  clearTimeout(spawnTimer);
  if (!running) return;

  const delay = getSpawnDelay();
  if (delay === null) {
    checkEndCondition();
    return;
  }
  spawnTimer = setTimeout(spawnBubble, delay);
}

function checkEndCondition() {
  if (!running) return;
  const elapsed = Date.now() - sessionStart;
  if (elapsed >= SESSION_MS || (elapsed >= WIND_DOWN_MS + 6000 && activeBubbles === 0)) {
    finishSession();
  }
}

function updateCount() {
  const el = overlay?.querySelector(".bubble-play-count");
  if (el) el.textContent = poppedCount > 0 ? `已轻放 ${poppedCount} 个心事` : "";
}

function tickSession() {
  if (!running) return;
  const elapsed = Date.now() - sessionStart;
  const hint = overlay.querySelector(".bubble-play-hint");

  if (elapsed >= WIND_DOWN_MS && hint) {
    hint.textContent = "泡泡渐渐变少了……";
    hint.classList.add("is-fading");
  }

  if (elapsed >= SESSION_MS) {
    finishSession();
    return;
  }
  checkEndCondition();
}

function showScreen(name) {
  overlay.querySelector(".bubble-screen--welcome").hidden = name !== "welcome";
  overlay.querySelector(".bubble-screen--play").hidden = name !== "play";
  overlay.querySelector(".bubble-screen--end").hidden = name !== "end";
}

function clearSession() {
  clearTimeout(spawnTimer);
  clearInterval(tickTimer);
  spawnTimer = null;
  tickTimer = null;
  running = false;
  activeBubbles = 0;
  if (arena) arena.innerHTML = "";
}

function startSession() {
  clearSession();
  arena = overlay.querySelector(".bubble-arena");
  poppedCount = 0;
  sessionStart = Date.now();
  running = true;

  const hint = overlay.querySelector(".bubble-play-hint");
  hint.textContent = "轻轻点破飘起的心事";
  hint.classList.remove("is-fading");

  showScreen("play");
  updateCount();
  spawnBubble();
  tickTimer = setInterval(tickSession, 800);
}

function finishSession() {
  if (!running) return;
  running = false;
  clearTimeout(spawnTimer);
  clearInterval(tickTimer);

  overlay.querySelector(".bubble-end-num").textContent = String(poppedCount);
  showScreen("end");
}

function showWelcome() {
  clearSession();
  showScreen("welcome");
}

function openOverlay() {
  if (!overlay) overlay = createOverlay();
  showWelcome();
  overlay.classList.add("is-open");
  document.body.classList.add("bubble-overlay-open");
  overlay.querySelector(".bubble-start-btn").focus();
}

function closeOverlay() {
  if (!overlay) return;
  clearSession();
  overlay.classList.remove("is-open");
  document.body.classList.remove("bubble-overlay-open");
  showWelcome();
}

function bindOverlayEvents() {
  overlay.addEventListener("click", (e) => {
    if (e.target.closest(".bubble-overlay-close") || e.target.closest(".bubble-finish-btn")) {
      closeOverlay();
    }
    if (e.target.closest(".bubble-start-btn")) {
      ensureAudio();
      startSession();
    }
    if (e.target.closest(".bubble-restart-btn")) {
      startSession();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay?.classList.contains("is-open")) {
      closeOverlay();
    }
  });
}

export function initBubbleGame() {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-bubble-game]");
    if (!trigger) return;
    e.preventDefault();
    if (!overlay) {
      overlay = createOverlay();
      bindOverlayEvents();
    }
    openOverlay();
  });
}
