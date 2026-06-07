import { healingModules } from "./data/healing-modules.js";

function renderSteps(steps) {
  return steps
    .map(
      (step, i) => `
      <li class="healing-step">
        <span class="healing-step-num">${String(i + 1).padStart(2, "0")}</span>
        <div class="healing-step-body">
          <p class="healing-step-zh">${step.zh}</p>
          <p class="healing-step-en">${step.en}</p>
        </div>
      </li>
    `
    )
    .join("");
}

function renderCard(mod) {
  return `
    <article class="healing-card healing-card--${mod.accent}" id="healing-${mod.id}">
      <div class="healing-card-glow" aria-hidden="true"></div>
      <header class="healing-card-head">
        <span class="healing-card-icon" aria-hidden="true">${mod.icon}</span>
        <div class="healing-card-titles">
          <h3 class="healing-card-title-zh">${mod.titleZh}</h3>
          <p class="healing-card-title-en">${mod.titleEn}</p>
        </div>
      </header>
      <p class="healing-card-tag">
        <span lang="zh-CN">${mod.tagZh}</span>
        <span class="healing-card-tag-sep" aria-hidden="true">·</span>
        <span lang="en">${mod.tagEn}</span>
      </p>
      <div class="healing-card-about">
        <div class="healing-lang-block">
          <span class="healing-lang-label">中文</span>
          <p lang="zh-CN">${mod.aboutZh}</p>
        </div>
        <div class="healing-lang-block healing-lang-block--en">
          <span class="healing-lang-label">EN</span>
          <p lang="en">${mod.aboutEn}</p>
        </div>
      </div>
      <details class="healing-details" open>
        <summary class="healing-details-summary">
          <span>操作方法 · How to practice</span>
          <span class="healing-details-chevron" aria-hidden="true"></span>
        </summary>
        <ol class="healing-steps">${renderSteps(mod.steps)}</ol>
      </details>
      ${
        mod.id === "music"
          ? `
      <div class="healing-immersive healing-immersive--warm">
        <p class="healing-immersive-label">沉浸式体验 · Immersive</p>
        <button class="healing-immersive-btn" type="button" data-music-immersive>
          <span class="healing-immersive-icon" aria-hidden="true">♪</span>
          <span class="healing-immersive-text">进入自然之声空间</span>
          <span class="healing-immersive-arrow" aria-hidden="true">→</span>
        </button>
      </div>
      `
          : mod.id === "breath"
          ? `
      <div class="healing-immersive healing-immersive--lavender">
        <p class="healing-immersive-label">沉浸式体验 · Immersive</p>
        <button class="healing-immersive-btn" type="button" data-breath-immersive>
          <span class="healing-immersive-icon" aria-hidden="true">◌</span>
          <span class="healing-immersive-text">进入呼吸疗愈空间</span>
          <span class="healing-immersive-arrow" aria-hidden="true">→</span>
        </button>
      </div>
      `
          : mod.id === "play"
          ? `
      <div class="healing-immersive healing-immersive--rose">
        <p class="healing-immersive-label">小游戏 · Mini Game</p>
        <button class="healing-immersive-btn" type="button" data-bubble-game>
          <span class="healing-immersive-icon" aria-hidden="true">◯</span>
          <span class="healing-immersive-text">玩「心事泡泡」</span>
          <span class="healing-immersive-arrow" aria-hidden="true">→</span>
        </button>
      </div>
      `
          : mod.id === "anxiety"
            ? `
      <div class="healing-immersive healing-immersive--gold">
        <p class="healing-immersive-label">体验板块 · Experience</p>
        <button class="healing-immersive-btn" type="button" data-anxiety-journal>
          <span class="healing-immersive-icon" aria-hidden="true">◎</span>
          <span class="healing-immersive-text">打开心情日记本</span>
          <span class="healing-immersive-arrow" aria-hidden="true">→</span>
        </button>
      </div>
      `
            : ""
      }
    </article>
  `;
}

export function renderHealingSection() {
  return `
    <section class="healing-hub" id="healing-hub" aria-labelledby="healing-hub-title">
      <div class="healing-hub-bg" aria-hidden="true"></div>
      <header class="healing-hub-header">
        <p class="healing-hub-eyebrow">
          <span class="healing-hub-eyebrow-dot"></span>
          Healing Space · 疗愈空间
        </p>
        <h2 class="healing-hub-title" id="healing-hub-title">四种温柔的自护方式</h2>
        <div class="healing-recommend">
          <span class="healing-recommend-icon" aria-hidden="true">💫</span>
          <span class="healing-recommend-label">千问为你推荐 · 四种疗愈模式</span>
          <span class="healing-recommend-label-en" lang="en">Qwen picks · Four healing modes</span>
        </div>
        <p class="healing-hub-sub">
          情绪被读懂之后，身体和心也需要被轻轻安放。<br class="healing-br-desktop" />
          下面是千问结合常见状态整理的自护参考——不必四项都做，选此刻最需要的一种就好。
        </p>
        <p class="healing-hub-sub-en" lang="en">
          Once feelings are heard, the body still needs care. Four gentle paths below—choose one that fits you today, not all at once.
        </p>
        <nav class="healing-nav" aria-label="疗愈模块快捷导航">
          ${healingModules
            .map(
              (m) =>
                `<a class="healing-nav-link healing-nav-link--${m.accent}" href="#healing-${m.id}">${m.titleZh}</a>`
            )
            .join("")}
        </nav>
      </header>
      <div class="healing-grid">
        ${healingModules.map(renderCard).join("")}
      </div>
      <p class="healing-disclaimer" lang="zh-CN">
        以上内容为自助科普，不替代医疗或心理咨询。若你感到难以承受，请寻求专业人士帮助。
      </p>
      <p class="healing-disclaimer-en" lang="en">
        For self-care education only—not a substitute for medical or psychological treatment.
      </p>
    </section>
  `;
}
