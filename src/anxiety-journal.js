const STORAGE_KEY = "anxiety-journal-entries";
const WELCOME_TEXT =
  "记录即疗愈，仅仅将脑海中想法和情绪记录下来，就可以帮助减轻心理负担";

let overlay = null;

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}年${m}月${day}日 ${h}:${min}`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createOverlay() {
  const el = document.createElement("div");
  el.className = "journal-overlay";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "焦虑日记记录");
  el.innerHTML = `
    <div class="journal-overlay-bg" aria-hidden="true"></div>
    <button class="journal-overlay-close" type="button" aria-label="关闭">
      <span aria-hidden="true">×</span>
    </button>

    <div class="journal-screen journal-screen--welcome">
      <div class="journal-welcome-inner">
        <p class="journal-welcome-eyebrow">记录疗愈 · Journal Healing</p>
        <p class="journal-welcome-text">${WELCOME_TEXT}</p>
        <button class="btn btn-primary journal-start-btn" type="button">开始记录</button>
      </div>
    </div>

    <div class="journal-screen journal-screen--app" hidden>
      <div class="journal-app">
        <header class="journal-app-head">
          <h2 class="journal-app-title">心情日记本</h2>
          <p class="journal-app-sub">写下此刻的烦心事、想法或情绪，不必完美</p>
        </header>

        <nav class="journal-tabs" aria-label="日记功能切换">
          <button class="journal-tab is-active" type="button" data-tab="write">写日记</button>
          <button class="journal-tab" type="button" data-tab="history">
            历史记录
            <span class="journal-tab-count" data-history-count>0</span>
          </button>
        </nav>

        <div class="journal-panel journal-panel--write" data-panel="write">
          <label class="journal-label" for="journal-input">今天想说的话</label>
          <div class="journal-book">
            <textarea
              id="journal-input"
              class="journal-textarea"
              placeholder="在这里写下让你焦虑的事、反复出现的念头，或任何想倾诉的内容……"
              maxlength="2000"
            ></textarea>
          </div>
          <p class="journal-char-count"><span data-char-count>0</span> / 2000</p>
          <button class="btn btn-primary journal-upload-btn" type="button">上传</button>
          <p class="journal-toast" data-toast hidden aria-live="polite"></p>
        </div>

        <div class="journal-panel journal-panel--history" data-panel="history" hidden>
          <ul class="journal-history-list" data-history-list></ul>
          <p class="journal-history-empty" data-history-empty hidden>
            还没有记录，写下第一篇日记吧
          </p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  return el;
}

function updateCharCount() {
  const input = overlay.querySelector("#journal-input");
  const counter = overlay.querySelector("[data-char-count]");
  counter.textContent = input.value.length;
}

function showToast(message) {
  const toast = overlay.querySelector("[data-toast]");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function renderHistory() {
  const entries = loadEntries();
  const listEl = overlay.querySelector("[data-history-list]");
  const emptyEl = overlay.querySelector("[data-history-empty]");
  const countEl = overlay.querySelector("[data-history-count]");

  countEl.textContent = entries.length;

  if (entries.length === 0) {
    listEl.innerHTML = "";
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  listEl.innerHTML = entries
    .map(
      (entry) => `
      <li class="journal-history-item">
        <time class="journal-history-date" datetime="${entry.createdAt}">
          ${formatDate(entry.createdAt)}
        </time>
        <p class="journal-history-content">${escapeHtml(entry.content).replace(/\n/g, "<br>")}</p>
      </li>
    `
    )
    .join("");
}

function switchTab(tab) {
  overlay.querySelectorAll(".journal-tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tab === tab);
  });
  overlay.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tab;
  });
  if (tab === "history") renderHistory();
}

function showWelcome() {
  overlay.querySelector(".journal-screen--welcome").hidden = false;
  overlay.querySelector(".journal-screen--app").hidden = true;
}

function startJournal() {
  overlay.querySelector(".journal-screen--welcome").hidden = true;
  overlay.querySelector(".journal-screen--app").hidden = false;
  switchTab("write");
  overlay.querySelector("#journal-input").value = "";
  updateCharCount();
  overlay.querySelector("#journal-input").focus();
}

function uploadEntry() {
  const input = overlay.querySelector("#journal-input");
  const content = input.value.trim();
  if (!content) {
    showToast("请先写下一些内容再上传");
    return;
  }

  const entries = loadEntries();
  entries.unshift({
    id: crypto.randomUUID?.() ?? String(Date.now()),
    content,
    createdAt: new Date().toISOString(),
  });
  saveEntries(entries);
  input.value = "";
  updateCharCount();
  showToast("已保存，记录即疗愈 ✓");
  renderHistory();
}

function openOverlay() {
  if (!overlay) overlay = createOverlay();
  showWelcome();
  overlay.classList.add("is-open");
  document.body.classList.add("journal-overlay-open");
  overlay.querySelector(".journal-start-btn").focus();
}

function closeOverlay() {
  if (!overlay) return;
  overlay.classList.remove("is-open");
  document.body.classList.remove("journal-overlay-open");
  showWelcome();
}

function bindOverlayEvents() {
  overlay.addEventListener("click", (e) => {
    if (e.target.closest(".journal-overlay-close")) {
      closeOverlay();
    }
    if (e.target.closest(".journal-start-btn")) {
      startJournal();
    }
    if (e.target.closest(".journal-upload-btn")) {
      uploadEntry();
    }
    const tabBtn = e.target.closest(".journal-tab");
    if (tabBtn) {
      switchTab(tabBtn.dataset.tab);
    }
  });

  overlay.querySelector("#journal-input").addEventListener("input", updateCharCount);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay?.classList.contains("is-open")) {
      closeOverlay();
    }
  });
}

export function initAnxietyJournal() {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-anxiety-journal]");
    if (!trigger) return;
    e.preventDefault();
    if (!overlay) {
      overlay = createOverlay();
      bindOverlayEvents();
    }
    openOverlay();
  });
}
