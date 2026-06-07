/** 背景音乐 · 多路径兼容本地与 GitHub Pages */
import { audioCandidates, loadAudioElement } from "../utils/asset-path.js";

const AMBIENT_TRACK = "the-name-of-life.mp3";
const LOCAL_CANDIDATES = audioCandidates(AMBIENT_TRACK);

const TARGET_VOLUME = 0.32;
const FADE_MS = 2600;

let mode = "none"; // "file" | "synth"
let audio = null;
let currentSrc = null;
let ctx = null;
let masterGain = null;
let synthNodes = [];
let isPlaying = false;
let fadeTimer = null;

/* ---------- 文件播放 ---------- */

function createAudio(src) {
  if (audio && currentSrc === src) return audio;
  if (audio) {
    audio.pause();
    audio = null;
  }
  currentSrc = src;
  audio = new Audio(src);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  return audio;
}

function waitCanPlay(el, timeout = 60000) {
  return new Promise((resolve, reject) => {
    if (el.readyState >= 2) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("TIMEOUT"));
    }, timeout);
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("LOAD_FAILED"));
    };
    const cleanup = () => {
      clearTimeout(timer);
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("error", onError);
    };
    el.addEventListener("canplay", onReady, { once: true });
    el.addEventListener("error", onError, { once: true });
    el.load();
  });
}

async function tryLoadLocalFile() {
  for (const src of LOCAL_CANDIDATES) {
    try {
      const el = createAudio(src);
      await waitCanPlay(el);
      mode = "file";
      hideMissingNotice();
      return true;
    } catch {
      /* next */
    }
  }
  return false;
}

/* ---------- 合成备用音（确保点击后有声音） ---------- */

function createSynthEngine() {
  if (ctx) return;

  ctx = new AudioContext();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0;

  const highPass = ctx.createBiquadFilter();
  highPass.type = "highpass";
  highPass.frequency.value = 380;
  highPass.connect(masterGain);
  masterGain.connect(ctx.destination);

  [523.25, 659.25, 783.99, 987.77].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08 + i * 0.02;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 1.2 + i * 0.3;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const gain = ctx.createGain();
    gain.gain.value = 0.045 - i * 0.006;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3200 + i * 400;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(highPass);
    osc.start();
    lfo.start();
    synthNodes.push(osc, lfo);
  });
}

function stopSynth() {
  synthNodes.forEach((n) => {
    try {
      n.stop();
    } catch {
      /* stopped */
    }
  });
  synthNodes = [];
  if (ctx) {
    ctx.close();
    ctx = null;
    masterGain = null;
  }
}

async function prepareAudio() {
  const hasLocal = await tryLoadLocalFile();
  if (hasLocal) return;

  mode = "synth";
  showMissingNotice();
  createSynthEngine();
  if (ctx.state === "suspended") await ctx.resume();
}

/* ---------- 音量渐变 ---------- */

function fadeIn() {
  clearInterval(fadeTimer);
  const steps = 40;
  const stepMs = FADE_MS / steps;
  const volStep = TARGET_VOLUME / steps;

  if (mode === "file" && audio) {
    let current = audio.volume;
    fadeTimer = setInterval(() => {
      current = Math.min(TARGET_VOLUME, current + volStep);
      audio.volume = current;
      if (current >= TARGET_VOLUME) clearInterval(fadeTimer);
    }, stepMs);
  } else if (mode === "synth" && masterGain) {
    let current = masterGain.gain.value;
    fadeTimer = setInterval(() => {
      current = Math.min(TARGET_VOLUME * 0.85, current + volStep);
      masterGain.gain.setTargetAtTime(current, ctx.currentTime, 0.04);
      if (current >= TARGET_VOLUME * 0.85 - 0.001) clearInterval(fadeTimer);
    }, stepMs);
  }
}

function fadeOut(thenStop = true) {
  clearInterval(fadeTimer);
  const steps = 28;
  const stepMs = 45;

  if (mode === "file" && audio) {
    const volStep = audio.volume / steps || TARGET_VOLUME / steps;
    fadeTimer = setInterval(() => {
      audio.volume = Math.max(0, audio.volume - volStep);
      if (audio.volume <= 0.01) {
        clearInterval(fadeTimer);
        audio.volume = 0;
        if (thenStop) {
          audio.pause();
          isPlaying = false;
          updateToggleUI();
        }
      }
    }, stepMs);
  } else if (mode === "synth" && masterGain) {
    let current = masterGain.gain.value;
    const volStep = current / steps;
    fadeTimer = setInterval(() => {
      current = Math.max(0, current - volStep);
      masterGain.gain.setTargetAtTime(current, ctx.currentTime, 0.03);
      if (current <= 0.005) {
        clearInterval(fadeTimer);
        masterGain.gain.value = 0;
        if (thenStop) {
          stopSynth();
          isPlaying = false;
          updateToggleUI();
        }
      }
    }, stepMs);
  }
}

function showMissingNotice() {
  document.getElementById("music-missing")?.classList.add("visible");
}

function hideMissingNotice() {
  document.getElementById("music-missing")?.classList.remove("visible");
}

function updateToggleUI() {
  const btn = document.getElementById("music-toggle");
  const hint = document.getElementById("music-hint");
  if (!btn) return;
  btn.classList.toggle("playing", isPlaying);
  btn.setAttribute("aria-label", isPlaying ? "关闭背景音乐" : "开启背景音乐");
  btn.title = isPlaying ? "关闭音乐" : "开启音乐";
  if (hint && isPlaying) hint.classList.remove("visible");
}

function showAutoplayHint() {
  document.getElementById("music-hint")?.classList.add("visible");
}

function hideAutoplayHint() {
  document.getElementById("music-hint")?.classList.remove("visible");
}

export async function playMusic() {
  try {
    if (mode === "none") await prepareAudio();

    if (mode === "file" && audio) {
      await audio.play();
    } else if (mode === "synth") {
      if (!ctx || ctx.state === "closed") {
        mode = "none";
        await prepareAudio();
      }
      if (ctx.state === "suspended") await ctx.resume();
      if (ctx.state !== "running") {
        showAutoplayHint();
        return false;
      }
    } else {
      showAutoplayHint();
      return false;
    }

    isPlaying = true;
    updateToggleUI();
    fadeIn();
    hideAutoplayHint();
    return true;
  } catch {
    showAutoplayHint();
    return false;
  }
}

export function pauseMusic() {
  if (!isPlaying) return;
  fadeOut(true);
}

export function toggleMusic() {
  if (isPlaying) pauseMusic();
  else {
    if (mode === "file" && audio) audio.volume = 0;
    playMusic();
  }
}

export function initMusic() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <button class="music-toggle" id="music-toggle" type="button" aria-label="背景音乐">
      <span class="music-icon music-icon-on">♪</span>
      <span class="music-icon music-icon-off">♪</span>
      <span class="music-waves" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
    </button>
    <div class="music-hint visible" id="music-hint" role="status">
      <span class="music-hint-dot"></span>
      轻触页面，开启疗愈音乐
    </div>
    
    `
  );

  document.getElementById("music-toggle").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMusic();
  });

  const unlock = async () => {
    await playMusic();
    hideAutoplayHint();
    document.removeEventListener("click", unlock);
    document.removeEventListener("keydown", unlock);
    document.removeEventListener("touchstart", unlock);
  };
  document.addEventListener("click", unlock);
  document.addEventListener("keydown", unlock);
  document.addEventListener("touchstart", unlock, { passive: true });

  prepareAudio().then(() => playMusic()).catch(() => showAutoplayHint());
}

export function isMusicPlaying() {
  return isPlaying;
}
