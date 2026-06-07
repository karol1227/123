import { pauseMusic } from "./audio/ambient.js";
import { audioCandidates, imageCandidates, loadAudioElement } from "./utils/asset-path.js";

const SCENES = [
  {
    id: "insects",
    title: "春季虫鸣",
    subtitle: "Spring Chorus",
    file: "insects.mp3",
    image: "insects.jpg",
    immersive: true,
    immersiveText: {
      zh: [
        "仰观春树新绿，蓝天漏下柔光，风吹树叶沙沙，伴着细碎春虫轻鸣。",
        "春日虫鸣白噪音能抚平烦躁、隔绝嘈杂，有助安眠、凝神放松。",
      ],
      en: [
        "Looking up at fresh spring foliage, soft sunlight filters through blue skies; wind rustles leaves, mingled with faint chirps of spring insects.",
        "The white noise of spring insects calms irritation, blocks distractions, aids sleep and eases the mind.",
      ],
    },
  },
  {
    id: "storm",
    title: "雷电暴雨",
    subtitle: "Thunder Storm",
    file: "storm.mp3",
    image: "storm.jpg",
    immersive: true,
    immersiveText: {
      zh: [
        "紫电划破黯夜，雨幕倾泻而下，风声与雷鸣交织成天然的安眠序曲。",
        "雷雨白噪音掩蔽杂音、安定心神，助于深度放松与入眠。",
      ],
      en: [
        "Purple lightning cleaves the dark sky; rain pours down as wind and thunder weave a natural lullaby.",
        "Thunderstorm white noise masks distractions, steadies the mind, and supports deep rest and sleep.",
      ],
    },
  },
  {
    id: "forest",
    title: "森林秘境",
    subtitle: "Forest Stream",
    file: "forest.mp3",
    image: "forest.jpg",
    immersive: true,
    immersiveText: {
      zh: [
        "浓荫覆溪，清泉撞石潺潺流淌，满目苍翠清新。",
        "溪流白噪音舒缓心绪、隔绝杂音，助眠且提升专注力。",
      ],
      en: [
        "Lush foliage shades the brook; clear water tumbles over mossy stones in gentle ripples.",
        "Stream white noise calms mood, masks noise, improves sleep and focus.",
      ],
    },
  },
  {
    id: "bonfire",
    title: "松木篝火",
    subtitle: "Pine Bonfire",
    file: "bonfire.mp3",
    image: "bonfire.jpg",
    immersive: true,
    immersiveText: {
      zh: [
        "夜色静深，松木烈火跃动，火星点点升起，暖意徐徐包裹全身。",
        "篝火白噪音舒缓神经、隔绝纷扰，助眠亦养神。",
      ],
      en: [
        "Night deepens as pine logs burn bright; sparks drift upward, wrapping you in gentle warmth.",
        "Bonfire white noise soothes nerves, blocks distractions, aids sleep and eases the mind.",
      ],
    },
  },
];

const AUDIO_CANDIDATES = (file) => audioCandidates(file);
const IMAGE_CANDIDATES = (file) => imageCandidates(file);
const TARGET_VOLUME = 0.55;
const FADE_MS = 1800;

let overlay = null;
let sceneAudio = null;
let activeSceneId = null;
let fadeTimer = null;

function renderScenePhoto(scene) {
  const [src, fallback] = IMAGE_CANDIDATES(scene.image);
  return `
    <img
      class="music-scene-photo"
      src="${src}"
      data-fallback="${fallback}"
      alt="${scene.title}"
      loading="lazy"
    />
  `;
}

function renderImmersiveContent(scene) {
  return `
    <div class="music-immersive-scene-content">
      <h2 class="music-immersive-scene-title">${scene.title}</h2>
      <div class="music-immersive-scene-text">
        ${scene.immersiveText.zh.map((p) => `<p lang="zh-CN">${p}</p>`).join("")}
        ${scene.immersiveText.en.map((p) => `<p lang="en" class="music-immersive-scene-text-en">${p}</p>`).join("")}
      </div>
      <button class="btn btn-ghost music-immersive-scene-back" type="button">返回场景选择</button>
    </div>
  `;
}

function renderInsectsFx(src, fallback) {
  return `
    <div class="music-immersive-scene-bg" aria-hidden="true">
      <div class="music-immersive-scene-img-wrap music-immersive-fx--sway">
        <img class="music-immersive-scene-img music-immersive-fx--ken-burns" src="${src}" data-fallback="${fallback}" alt="" />
      </div>
      <div class="music-immersive-fx-wind"></div>
      <div class="music-immersive-fx-sunbeams">
        <span></span><span></span><span></span><span></span>
      </div>
      <div class="music-immersive-fx-dapple"></div>
      <div class="music-immersive-scene-vignette"></div>
    </div>
  `;
}

function renderStormFx(src, fallback) {
  return `
    <div class="music-immersive-scene-bg" aria-hidden="true">
      <div class="music-immersive-scene-img-wrap music-immersive-fx--storm-drift">
        <img class="music-immersive-scene-img music-immersive-fx--storm-zoom" src="${src}" data-fallback="${fallback}" alt="" />
      </div>
      <div class="music-immersive-fx-rain"></div>
      <div class="music-immersive-fx-rain music-immersive-fx-rain--heavy"></div>
      <div class="music-immersive-fx-lightning"></div>
      <div class="music-immersive-fx-lightning-flash"></div>
      <div class="music-immersive-fx-storm-glow"></div>
      <div class="music-immersive-scene-vignette music-immersive-scene-vignette--storm"></div>
    </div>
  `;
}

function renderForestFx(src, fallback) {
  return `
    <div class="music-immersive-scene-bg" aria-hidden="true">
      <div class="music-immersive-scene-img-wrap music-immersive-fx--forest-drift">
        <img class="music-immersive-scene-img music-immersive-fx--forest-flow" src="${src}" data-fallback="${fallback}" alt="" />
      </div>
      <div class="music-immersive-fx-mist"></div>
      <div class="music-immersive-fx-stream-shimmer"></div>
      <div class="music-immersive-fx-forest-light"></div>
      <div class="music-immersive-scene-vignette music-immersive-scene-vignette--forest"></div>
    </div>
  `;
}

function renderBonfireFx(src, fallback) {
  return `
    <div class="music-immersive-scene-bg" aria-hidden="true">
      <div class="music-immersive-scene-img-wrap music-immersive-fx--bonfire-drift">
        <img class="music-immersive-scene-img music-immersive-fx--bonfire-glow" src="${src}" data-fallback="${fallback}" alt="" />
      </div>
      <div class="music-immersive-fx-fire-glow"></div>
      <div class="music-immersive-fx-flame-flicker"></div>
      <div class="music-immersive-fx-embers">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      <div class="music-immersive-fx-warm-haze"></div>
      <div class="music-immersive-scene-vignette music-immersive-scene-vignette--bonfire"></div>
    </div>
  `;
}

const IMMERSIVE_FX = {
  insects: renderInsectsFx,
  storm: renderStormFx,
  forest: renderForestFx,
  bonfire: renderBonfireFx,
};

function renderImmersiveScene(scene) {
  const [src, fallback] = IMAGE_CANDIDATES(scene.image);
  const renderFx = IMMERSIVE_FX[scene.id];
  if (!renderFx) return "";

  return `
    <div
      class="music-immersive-scene music-immersive-scene--${scene.id}"
      data-immersive-id="${scene.id}"
      hidden
    >
      ${renderFx(src, fallback)}
      ${renderImmersiveContent(scene)}
    </div>
  `;
}

function bindScenePhotos() {
  overlay.querySelectorAll(".music-scene-photo, .music-immersive-scene-img").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        const fallback = img.dataset.fallback;
        if (fallback && img.src !== new URL(fallback, window.location.href).href) {
          img.src = fallback;
        }
      },
      { once: true }
    );
  });
}

function showSelection() {
  overlay.classList.remove("is-immersive");
  overlay.querySelector("[data-music-select]").hidden = false;
  overlay.querySelectorAll("[data-immersive-id]").forEach((el) => {
    el.hidden = true;
  });
}

async function enterImmersive(sceneId) {
  const scene = SCENES.find((s) => s.id === sceneId);
  if (!scene?.immersive) return;

  pauseMusic();
  clearFade();
  if (sceneAudio) {
    sceneAudio.pause();
    sceneAudio = null;
  }
  clearActiveCard();

  overlay.classList.add("is-immersive");
  overlay.querySelector("[data-music-select]").hidden = true;
  overlay.querySelectorAll("[data-immersive-id]").forEach((el) => {
    el.hidden = el.dataset.immersiveId !== sceneId;
  });

  sceneAudio = await loadSceneAudio(scene.file);
  if (sceneAudio) {
    try {
      await sceneAudio.play();
      fadeVolume(TARGET_VOLUME);
    } catch {
      /* autoplay blocked */
    }
  }
}

function exitImmersive() {
  stopSceneAudio();
  showSelection();
}

async function handleSceneClick(sceneId) {
  const scene = SCENES.find((s) => s.id === sceneId);
  if (!scene) return;

  if (scene.immersive) {
    await enterImmersive(sceneId);
    return;
  }

  await toggleScene(sceneId);
}

function renderSceneCards() {
  return SCENES.map(
    (scene) => `
    <button class="music-scene-card" type="button" data-scene-id="${scene.id}" aria-pressed="false">
      <div class="music-scene-card-visual">
        ${renderScenePhoto(scene)}
        <div class="music-scene-card-overlay"></div>
        <span class="music-scene-card-playing" aria-hidden="true">♪ 播放中</span>
      </div>
      <div class="music-scene-card-info">
        <h3 class="music-scene-card-title">${scene.title}</h3>
        <p class="music-scene-card-sub">${scene.subtitle}</p>
      </div>
    </button>
  `
  ).join("");
}

function createOverlay() {
  const el = document.createElement("div");
  el.className = "music-overlay";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "音乐疗愈沉浸式体验");
  el.innerHTML = `
    <div class="music-overlay-bg" aria-hidden="true"></div>
    <button class="music-overlay-close" type="button" aria-label="关闭">
      <span aria-hidden="true">×</span>
    </button>

    <div class="music-screen" data-music-select>
      <header class="music-select-head">
        <p class="music-select-eyebrow">沉浸式体验 · Immersive Sound</p>
        <h2 class="music-select-title">选择一种自然之声</h2>
        <p class="music-select-sub">点击场景卡片进入沉浸体验</p>
      </header>
      <div class="music-scene-grid">
        ${renderSceneCards()}
      </div>
    </div>

    ${SCENES.filter((s) => s.immersive).map(renderImmersiveScene).join("")}
  `;
  document.body.appendChild(el);
  return el;
}

function clearFade() {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function fadeVolume(to, then) {
  clearFade();
  if (!sceneAudio) return;
  const steps = 30;
  const stepMs = FADE_MS / steps;
  const from = sceneAudio.volume;
  const delta = (to - from) / steps;
  let current = from;
  let step = 0;
  fadeTimer = setInterval(() => {
    step += 1;
    current = step >= steps ? to : from + delta * step;
    sceneAudio.volume = Math.max(0, Math.min(1, current));
    if (step >= steps) {
      clearFade();
      then?.();
    }
  }, stepMs);
}

function setActiveCard(sceneId) {
  overlay.querySelectorAll(".music-scene-card").forEach((card) => {
    const active = card.dataset.sceneId === sceneId;
    card.classList.toggle("is-active", active);
    card.setAttribute("aria-pressed", active ? "true" : "false");
  });
  activeSceneId = sceneId;
}

function clearActiveCard() {
  overlay.querySelectorAll(".music-scene-card").forEach((card) => {
    card.classList.remove("is-active");
    card.setAttribute("aria-pressed", "false");
  });
  activeSceneId = null;
}

async function loadSceneAudio(file) {
  return loadAudioElement(AUDIO_CANDIDATES(file), { timeoutMs: 90000 });
}

function stopSceneAudio() {
  clearFade();
  if (sceneAudio) {
    sceneAudio.pause();
    sceneAudio = null;
  }
  clearActiveCard();
}

async function toggleScene(sceneId) {
  if (activeSceneId === sceneId && sceneAudio && !sceneAudio.paused) {
    fadeVolume(0, () => {
      sceneAudio.pause();
      clearActiveCard();
    });
    return;
  }

  const scene = SCENES.find((s) => s.id === sceneId);
  if (!scene) return;

  pauseMusic();
  clearFade();
  if (sceneAudio) {
    sceneAudio.pause();
    sceneAudio = null;
  }

  setActiveCard(sceneId);
  sceneAudio = await loadSceneAudio(scene.file);

  if (!sceneAudio) {
    clearActiveCard();
    return;
  }

  try {
    await sceneAudio.play();
    fadeVolume(TARGET_VOLUME);
  } catch {
    clearActiveCard();
  }
}

function openOverlay() {
  if (!overlay) overlay = createOverlay();
  showSelection();
  overlay.classList.add("is-open");
  document.body.classList.add("music-overlay-open");
}

function closeOverlay() {
  if (!overlay) return;
  stopSceneAudio();
  showSelection();
  overlay.classList.remove("is-open", "is-immersive");
  document.body.classList.remove("music-overlay-open");
}

function bindOverlayEvents() {
  overlay.addEventListener("click", (e) => {
    if (e.target.closest(".music-overlay-close")) {
      closeOverlay();
    }
    if (e.target.closest(".music-immersive-scene-back")) {
      exitImmersive();
    }
    const card = e.target.closest(".music-scene-card");
    if (card) {
      handleSceneClick(card.dataset.sceneId);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !overlay?.classList.contains("is-open")) return;
    if (overlay.classList.contains("is-immersive")) {
      exitImmersive();
    } else {
      closeOverlay();
    }
  });
}

export function initMusicImmersive() {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-music-immersive]");
    if (!trigger) return;
    e.preventDefault();
    if (!overlay) {
      overlay = createOverlay();
      bindScenePhotos();
      bindOverlayEvents();
    }
    openOverlay();
  });
}
