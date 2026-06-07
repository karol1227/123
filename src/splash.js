const LEAVE_MS = 1100;

function createFireflies(container, count = 36) {
  for (let i = 0; i < count; i++) {
    const f = document.createElement("span");
    f.className = "splash-firefly";
    f.style.left = `${Math.random() * 100}%`;
    f.style.top = `${Math.random() * 100}%`;
    f.style.animationDuration = `${4 + Math.random() * 8}s`;
    f.style.animationDelay = `${Math.random() * 6}s`;
    const size = 2 + Math.random() * 3;
    f.style.width = f.style.height = `${size}px`;
    container.appendChild(f);
  }
}

function mountSplashMarkup() {
  const root = document.createElement("div");
  root.className = "splash";
  root.id = "splash";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "欢迎页");
  root.innerHTML = `
    <div class="splash-sky" aria-hidden="true">
      <div class="splash-aurora splash-aurora--1"></div>
      <div class="splash-aurora splash-aurora--2"></div>
      <div class="splash-aurora splash-aurora--3"></div>
      <div class="splash-stars"></div>
    </div>
    <div class="splash-orbs" aria-hidden="true">
      <div class="splash-orb splash-orb--a"></div>
      <div class="splash-orb splash-orb--b"></div>
    </div>
    <div class="splash-fireflies" id="splash-fireflies" aria-hidden="true"></div>
    <div class="splash-waves" aria-hidden="true">
      <div class="splash-wave splash-wave--1"></div>
      <div class="splash-wave splash-wave--2"></div>
      <div class="splash-wave splash-wave--3"></div>
    </div>
    <div class="splash-layout">
      <div class="splash-hero">
        <div class="splash-orb splash-orb--moon">
          <span class="splash-orb-text">千问</span>
        </div>
      </div>
      <div class="splash-content">
      <p class="splash-eyebrow">
        <span class="splash-eyebrow-dot"></span>
        通义 · 情感理解
      </p>
      <h1 class="splash-title">心声</h1>
      <p class="splash-tagline">
        在这里，先慢一点<br />
        再有人听懂你
      </p>
      <button class="splash-enter" id="splash-enter" type="button">
        <span class="splash-enter-ring" aria-hidden="true"></span>
        <span class="splash-enter-label">进入</span>
        <span class="splash-enter-arrow" aria-hidden="true">→</span>
      </button>
      <p class="splash-footnote">轻触进入，开启一段被理解的旅程</p>
      </div>
    </div>
  `;
  document.body.prepend(root);
  createFireflies(document.getElementById("splash-fireflies"));
  return root;
}

export function mountSplash(onEnter) {
  document.body.classList.add("splash-active");
  const splash = mountSplashMarkup();
  const enterBtn = document.getElementById("splash-enter");
  let leaving = false;

  const go = () => {
    if (leaving) return;
    leaving = true;
    enterBtn.disabled = true;
    splash.classList.add("splash--leaving");
    document.body.classList.add("splash-entering");

    setTimeout(() => {
      splash.remove();
      document.body.classList.remove("splash-active", "splash-entering");
      onEnter();
    }, LEAVE_MS);
  };

  enterBtn.addEventListener("click", go);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !leaving) go();
  });
}
