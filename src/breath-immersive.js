const WELCOME_TEXT =
  "亲爱的朋友，欢迎来到呼吸疗愈界面，请您放松身心，沉浸式体验这一治愈时刻，开启一段呼吸之旅";

const PHASES = [
  { label: "吸气", duration: 4000, scale: 1 },
  { label: "屏息", duration: 7000, scale: 1 },
  { label: "呼气", duration: 8000, scale: 0.62 },
];

let overlay = null;
let phaseTimer = null;
let phaseIndex = 0;
let running = false;

function createOverlay() {
  const el = document.createElement("div");
  el.className = "breath-overlay";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "呼吸疗愈沉浸式体验");
  el.innerHTML = `
    <div class="breath-overlay-bg" aria-hidden="true"></div>
    <button class="breath-overlay-close" type="button" aria-label="关闭">
      <span aria-hidden="true">×</span>
    </button>

    <div class="breath-screen breath-screen--welcome">
      <div class="breath-welcome-inner">
        <p class="breath-welcome-eyebrow">沉浸式体验 · Immersive Breath</p>
        <p class="breath-welcome-text">${WELCOME_TEXT}</p>
        <button class="btn btn-primary breath-start-btn" type="button">
          开始呼吸疗愈
        </button>
      </div>
    </div>

    <div class="breath-screen breath-screen--session" hidden>
      <div class="breath-session-stage">
        <div class="breath-ring-wrap" aria-hidden="true">
          <div class="breath-ring breath-ring--outer"></div>
          <div class="breath-ring breath-ring--mid"></div>
          <div class="breath-ring breath-ring--core"></div>
        </div>
        <p class="breath-phase-label" aria-live="polite">吸气</p>
        <p class="breath-phase-hint">跟随光圈节奏，慢慢呼吸</p>
      </div>
      <button class="btn btn-ghost breath-stop-btn" type="button">结束体验</button>
    </div>
  `;
  document.body.appendChild(el);
  return el;
}

function getRingEls() {
  return overlay.querySelectorAll(".breath-ring");
}

function setRingScale(scale, durationMs) {
  getRingEls().forEach((ring) => {
    ring.style.transition = `transform ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    ring.style.transform = `scale(${scale})`;
  });
}

function clearPhaseTimer() {
  if (phaseTimer) {
    clearTimeout(phaseTimer);
    phaseTimer = null;
  }
}

function runPhase(index) {
  if (!running || !overlay) return;

  const phase = PHASES[index];
  phaseIndex = index;

  const labelEl = overlay.querySelector(".breath-phase-label");
  labelEl.textContent = phase.label;

  const prevScale =
    index === 0 ? PHASES[PHASES.length - 1].scale : PHASES[index - 1].scale;
  setRingScale(prevScale, 0);

  requestAnimationFrame(() => {
    setRingScale(phase.scale, phase.duration);
  });

  phaseTimer = setTimeout(() => {
    runPhase((index + 1) % PHASES.length);
  }, phase.duration);
}

function showWelcome() {
  running = false;
  clearPhaseTimer();

  overlay.querySelector(".breath-screen--welcome").hidden = false;
  overlay.querySelector(".breath-screen--session").hidden = true;
  setRingScale(0.62, 0);
  overlay.querySelector(".breath-phase-label").textContent = "吸气";
}

function startSession() {
  overlay.querySelector(".breath-screen--welcome").hidden = true;
  overlay.querySelector(".breath-screen--session").hidden = false;
  running = true;
  runPhase(0);
}

function openOverlay() {
  if (!overlay) overlay = createOverlay();
  showWelcome();
  overlay.classList.add("is-open");
  document.body.classList.add("breath-overlay-open");
  overlay.querySelector(".breath-start-btn").focus();
}

function closeOverlay() {
  if (!overlay) return;
  running = false;
  clearPhaseTimer();
  overlay.classList.remove("is-open");
  document.body.classList.remove("breath-overlay-open");
  showWelcome();
}

function bindOverlayEvents() {
  overlay.addEventListener("click", (e) => {
    if (e.target.closest(".breath-overlay-close") || e.target.closest(".breath-stop-btn")) {
      closeOverlay();
    }
    if (e.target.closest(".breath-start-btn")) {
      startSession();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay?.classList.contains("is-open")) {
      closeOverlay();
    }
  });
}

export function initBreathImmersive() {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-breath-immersive]");
    if (!trigger) return;
    e.preventDefault();
    if (!overlay) {
      overlay = createOverlay();
      bindOverlayEvents();
    }
    openOverlay();
  });
}
