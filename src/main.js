import { scenarios } from "./data/scenarios.js";
import { fetchAnalyze } from "./api/analyze.js";
import { recommendBook } from "./data/books.js";
import { initMusic } from "./audio/ambient.js";
import { mountSplash } from "./splash.js";
import { renderHealingSection } from "./healing-section.js";
import { initBreathImmersive } from "./breath-immersive.js";
import { initAnxietyJournal } from "./anxiety-journal.js";
import { initMusicImmersive } from "./music-immersive.js";
import { initBubbleGame } from "./bubble-game.js";

/* ===== 粒子背景 ===== */
function initParticles() {
  const container = document.createElement("div");
  container.className = "particles";
  document.body.prepend(container);

  for (let i = 0; i < 28; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${8 + Math.random() * 12}s`;
    p.style.animationDelay = `${Math.random() * 10}s`;
    p.style.width = p.style.height = `${2 + Math.random() * 4}px`;
    container.appendChild(p);
  }
}

/* ===== 打字机效果 ===== */
function typeText(el, text, speed = 28) {
  return new Promise((resolve) => {
    el.textContent = "";
    el.classList.add("typing-cursor");
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, speed);
      } else {
        el.classList.remove("typing-cursor");
        resolve();
      }
    };
    tick();
  });
}

/* ===== 渲染 ===== */
function render() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="bg-canvas"></div>
    <div class="app">
      <header class="hero">
        <div class="hero-badge">
          <span class="hero-badge-dot"></span>
          通义千问 · 情感理解
        </div>
        <h1>心声</h1>
        <p class="hero-sub">
          有些话，字面是平静的；<br />
          千问读到的，是背后轻轻颤动的情感与需求。
        </p>
      </header>

      <section class="section" style="animation-delay: 0.1s">
        <h2 class="section-title">选一个场景</h2>
        <div class="scenario-grid" id="scenario-grid">
          ${scenarios
            .map(
              (s) => `
            <button class="scenario-card" data-id="${s.id}" type="button">
              <p class="scenario-quote">「${s.quote}」</p>
              <p class="scenario-hint">${s.hint}</p>
            </button>
          `
            )
            .join("")}
        </div>
      </section>

      <section class="section" style="animation-delay: 0.2s">
        <h2 class="section-title">或，说说你的心里话</h2>
        <div class="input-panel">
          <label class="input-label" for="user-input">不必组织得很完美，就像平时说话一样</label>
          <div class="textarea-wrap">
            <textarea
              id="user-input"
              placeholder="例如：我没事…… / 随便吧 / 最近有点累……"
              maxlength="500"
            ></textarea>
          </div>
          <div class="input-actions">
            <button class="btn btn-primary" id="btn-analyze" type="button">
              让千问读懂我
            </button>
            <button class="btn btn-ghost" id="btn-clear" type="button">清空</button>
          </div>
        </div>

        <div class="result-panel" id="result-panel">
          <div class="compare-grid">
            <div class="compare-card literal">
              <div class="compare-label">
                <span class="compare-icon">📖</span>
                字面理解
              </div>
              <p class="compare-text" id="result-literal"></p>
            </div>
            <div class="compare-card emotional">
              <div class="compare-label">
                <span class="compare-icon">💫</span>
                情感读懂
              </div>
              <p class="compare-text" id="result-emotional"></p>
            </div>
          </div>
          <div class="emotion-tags" id="emotion-tags"></div>
          <div class="response-card" style="margin-top: 1.25rem">
            <div class="response-label">
              千问想对你说
              <span class="source-badge" id="source-badge" hidden></span>
            </div>
            <p class="response-text" id="result-response"></p>
          </div>

          <div class="book-card" id="book-card">
            <div class="book-header">
              <span class="book-icon">📚</span>
              <span class="book-label">千问为你荐书</span>
            </div>
            <p class="book-reason" id="book-reason"></p>
            <div class="book-meta">
              <h3 class="book-title" id="book-title"></h3>
              <p class="book-author" id="book-author"></p>
            </div>
            <blockquote class="book-excerpt">
              <p id="book-excerpt"></p>
              <footer id="book-excerpt-from"></footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section class="flow-steps">
        <div class="flow-step">
          <div class="flow-num">1</div>
          <h3>你说</h3>
          <p>日常的一句话，或藏在心里的感受</p>
        </div>
        <div class="flow-step">
          <div class="flow-num">2</div>
          <h3>千问读</h3>
          <p>不只听字面，更感知言外之意</p>
        </div>
        <div class="flow-step">
          <div class="flow-num">3</div>
          <h3>被接住</h3>
          <p>收到一份理解你需求的温暖回应</p>
        </div>
        <div class="flow-step">
          <div class="flow-num">4</div>
          <h3>遇好书</h3>
          <p>千问荐一本合你心情的书，摘录一句送给你</p>
        </div>
      </section>

      ${renderHealingSection()}

      <footer class="footer">
        <div class="footer-cta">
          <p class="footer-cta-text">
            想继续被读懂、被回应？欢迎前往阿里云，体验
            <span class="footer-brand">通义千问</span>
            大模型。
          </p>
          <a
            class="footer-cta-link"
            href="https://www.aliyun.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            前往阿里云 · 体验千问
            <span class="footer-cta-arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <p class="footer-copy">
          Powered by <span class="footer-brand">通义千问</span> · 理解字面，更读懂心声
        </p>
      </footer>
    </div>
  `;

  bindEvents();
  initBreathImmersive();
  initAnxietyJournal();
  initMusicImmersive();
  initBubbleGame();
}

let activeScenarioId = null;
let isAnalyzing = false;

function bindEvents() {
  document.getElementById("scenario-grid").addEventListener("click", (e) => {
    const card = e.target.closest(".scenario-card");
    if (!card) return;
    selectScenario(card.dataset.id);
  });

  document.getElementById("btn-analyze").addEventListener("click", () => {
    const text = document.getElementById("user-input").value.trim();
    if (text) analyzeText(text);
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    document.getElementById("user-input").value = "";
    activeScenarioId = null;
    document.querySelectorAll(".scenario-card").forEach((c) => c.classList.remove("active"));
    hideResult();
  });

  document.getElementById("user-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      document.getElementById("btn-analyze").click();
    }
  });
}

function selectScenario(id) {
  activeScenarioId = id;
  const scenario = scenarios.find((s) => s.id === id);
  if (!scenario) return;

  document.querySelectorAll(".scenario-card").forEach((c) => {
    c.classList.toggle("active", c.dataset.id === id);
  });

  document.getElementById("user-input").value = scenario.quote;
  analyzeText(scenario.quote);
}

async function analyzeText(text) {
  if (isAnalyzing) return;
  isAnalyzing = true;

  const btn = document.getElementById("btn-analyze");
  btn.disabled = true;
  btn.innerHTML = `<span class="loader"><span></span><span></span><span></span></span> 正在读懂…`;

  showResult();
  setLoading(true);
  hideSourceBadge();
  hideAnalyzeError();

  const scenario = activeScenarioId
    ? scenarios.find((s) => s.id === activeScenarioId)
    : null;
  if (scenario && scenario.quote !== text) {
    activeScenarioId = null;
    document.querySelectorAll(".scenario-card").forEach((c) => c.classList.remove("active"));
  }

  try {
    const analysis = await fetchAnalyze(text);
    const result = {
      ...analysis,
      book: recommendBook(text, analysis),
    };

    setLoading(false);
    await displayResult(result);
    showSourceBadge(analysis.source);
  } catch (err) {
    console.error("[analyze]", err);
    setLoading(false);
    showAnalyzeError(
      `${err.message}。请确认通过 http://localhost:8080 访问（不要直接双击打开 html 文件），并确保服务已启动。`
    );
  }

  isAnalyzing = false;
  btn.disabled = false;
  btn.textContent = "让千问读懂我";
}

function showResult() {
  document.getElementById("result-panel").classList.add("visible");
  document.getElementById("result-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideResult() {
  document.getElementById("result-panel").classList.remove("visible");
  hideSourceBadge();
  hideAnalyzeError();
}

function showSourceBadge(source) {
  const badge = document.getElementById("source-badge");
  if (!badge) return;
  if (source === "qwen") {
    badge.hidden = false;
    badge.textContent = "千问实时分析";
    badge.className = "source-badge source-qwen";
  } else {
    badge.hidden = true;
  }
}

function hideSourceBadge() {
  const badge = document.getElementById("source-badge");
  if (badge) badge.hidden = true;
}

function showAnalyzeError(message) {
  const literal = document.getElementById("result-literal");
  const emotional = document.getElementById("result-emotional");
  const response = document.getElementById("result-response");
  const tags = document.getElementById("emotion-tags");
  const bookCard = document.getElementById("book-card");

  tags.innerHTML = "";
  bookCard?.classList.remove("visible");
  literal.className = "compare-text";
  emotional.className = "compare-text";
  literal.textContent = "连接失败";
  emotional.textContent = "未能调用千问 API";
  response.textContent = message;
}

function hideAnalyzeError() {
  /* cleared when setLoading runs */
}

function setLoading(loading) {
  const literal = document.getElementById("result-literal");
  const emotional = document.getElementById("result-emotional");
  const response = document.getElementById("result-response");
  const tags = document.getElementById("emotion-tags");
  const bookCard = document.getElementById("book-card");

  tags.innerHTML = "";
  bookCard?.classList.remove("visible");

  if (loading) {
    literal.className = "compare-text loading";
    emotional.className = "compare-text loading";
    response.textContent = "";
    literal.innerHTML = `<span class="loader"><span></span><span></span><span></span></span> 理解字面意思…`;
    emotional.innerHTML = `<span class="loader"><span></span><span></span><span></span></span> 感知情感与需求…`;
  } else {
    literal.className = "compare-text";
    emotional.className = "compare-text";
  }
}

async function displayResult(result) {
  const literalEl = document.getElementById("result-literal");
  const emotionalEl = document.getElementById("result-emotional");
  const responseEl = document.getElementById("result-response");
  const tagsEl = document.getElementById("emotion-tags");
  const bookCard = document.getElementById("book-card");

  const allTags = [...(result.emotions || []), ...(result.needs || [])];
  tagsEl.innerHTML = allTags.map((t) => `<span class="emotion-tag">${t}</span>`).join("");

  await typeText(literalEl, result.literal, 22);
  await delay(300);
  await typeText(emotionalEl, result.emotional, 22);
  await delay(400);
  await typeText(responseEl, result.response, 30);

  if (result.book) {
    await delay(500);
    await displayBook(result.book);
  }
}

async function displayBook(book) {
  const bookCard = document.getElementById("book-card");
  const reasonEl = document.getElementById("book-reason");
  const titleEl = document.getElementById("book-title");
  const authorEl = document.getElementById("book-author");
  const excerptEl = document.getElementById("book-excerpt");
  const fromEl = document.getElementById("book-excerpt-from");

  bookCard.classList.add("visible");
  bookCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

  await typeText(reasonEl, book.reason, 24);
  await delay(200);
  titleEl.textContent = book.title;
  authorEl.textContent = book.author;
  await delay(300);
  await typeText(excerptEl, book.excerpt, 26);
  fromEl.textContent = `—— ${book.excerptFrom}`;
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function startApp() {
  initParticles();
  render();
  initMusic();
}

mountSplash(startApp);
