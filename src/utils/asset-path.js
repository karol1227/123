/** 站点根路径，兼容 GitHub Pages 子目录（如 /777/） */
export function getBasePath() {
  const { pathname } = window.location;
  if (pathname.endsWith("/")) return pathname;
  const file = pathname.slice(pathname.lastIndexOf("/") + 1);
  if (file.includes(".")) {
    return pathname.slice(0, pathname.lastIndexOf("/") + 1);
  }
  return `${pathname}/`;
}

function audioPath(base, filename) {
  return `${base}public/audio/${filename}`;
}

/** 音频候选路径（按优先级尝试） */
export function audioCandidates(filename) {
  const base = getBasePath();
  return [
    audioPath(base, filename),
    `./public/audio/${filename}`,
    `${base}audio/${filename}`,
    `/audio/${filename}`,
  ];
}

/** 图片候选路径 */
export function imageCandidates(filename) {
  const base = getBasePath();
  return [
    `${base}public/images/${filename}`,
    `./public/images/${filename}`,
    `${base}images/${filename}`,
    `/images/${filename}`,
  ];
}

/**
 * 尝试加载音频（流式，只需缓冲开头即可播放，不等待整文件）
 */
export function loadAudioElement(candidates, { timeoutMs = 60000, loop = true } = {}) {
  const tryOne = (src) =>
    new Promise((resolve, reject) => {
      const el = new Audio();
      el.preload = "auto";
      el.loop = loop;
      el.volume = 0;

      const timer = setTimeout(() => {
        cleanup();
        el.src = "";
        reject(new Error("timeout"));
      }, timeoutMs);

      const onReady = () => {
        cleanup();
        resolve(el);
      };

      const onError = () => {
        cleanup();
        el.src = "";
        reject(new Error("load failed"));
      };

      const cleanup = () => {
        clearTimeout(timer);
        el.removeEventListener("canplay", onReady);
        el.removeEventListener("error", onError);
      };

      el.addEventListener("canplay", onReady, { once: true });
      el.addEventListener("error", onError, { once: true });
      el.src = src;
      el.load();
    });

  return (async () => {
    for (const src of candidates) {
      try {
        return await tryOne(src);
      } catch {
        /* next */
      }
    }
    return null;
  })();
}
