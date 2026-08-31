import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
const tempRoot = mkdtempSync(join(tmpdir(), "glean-offline-build-"));
const outputPath = join(root, "glean-offline.html");
const sharedAssets = { css: [], js: [], images: [], cssIndex: new Map(), jsIndex: new Map(), imagesIndex: new Map() };

function copyProject() {
  cpSync(root, tempRoot, {
    recursive: true,
    filter: (source) => {
      const rel = relative(root, source);
      if (!rel) return true;
      return ![
        ".git",
        "node_modules",
        ".next",
        "out",
        "glean-offline.html",
      ].some((ignored) => rel === ignored || rel.startsWith(`${ignored}/`));
    },
  });
  const nodeModules = join(tempRoot, "node_modules");
  if (!existsSync(nodeModules)) {
    // A symlink keeps the temporary build fast and does not touch the source tree.
    symlinkSync(join(root, "node_modules"), nodeModules, "dir");
  }
  writeFileSync(
    join(tempRoot, "next.config.ts"),
    `import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {\n  output: "export",\n  trailingSlash: true,\n  images: { unoptimized: true },\n};\n\nexport default nextConfig;\n`,
  );
}

function runBuild() {
  const result = spawnSync("npm", ["run", "build", "--", "--webpack"], {
    cwd: tempRoot,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (result.status !== 0) {
    throw new Error(`Temporary static build failed with exit code ${result.status}`);
  }
}

const mimeTypes = {
  ".css": "text/css",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function dataUriFor(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  const mime = mimeTypes[ext] ?? "application/octet-stream";
  return `data:${mime};base64,${readFileSync(filePath).toString("base64")}`;
}

function findPublicAsset(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const candidates = [
    join(tempRoot, "out", clean.replace(/^\//, "")),
    join(tempRoot, "public", clean.replace(/^\//, "")),
  ];
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

function sharedAssetIndex(kind, content) {
  const list = sharedAssets[kind];
  const indexMap = sharedAssets[`${kind}Index`];
  const existing = indexMap.get(content);
  if (existing !== undefined) return existing;
  const index = list.length;
  list.push(content);
  indexMap.set(content, index);
  return index;
}

function findOutputAsset(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const asset = join(tempRoot, "out", clean.replace(/^\//, ""));
  return existsSync(asset) && statSync(asset).isFile() ? asset : undefined;
}

function inlineStyles(html) {
  return html.replace(/<link\b[^>]*?href=["']([^"']+\.css[^"']*)["'][^>]*>/gi, (whole, href) => {
    const asset = findOutputAsset(href);
    if (!asset) return whole;
    const index = sharedAssetIndex("css", readFileSync(asset, "utf8"));
    return `<link rel="stylesheet" href="__GLEAN_CSS_${index}__">`;
  });
}

function inlineScripts(html) {
  return html.replace(/<script\b[^>]*?src=["']([^"']+)["'][^>]*><\/script>/gi, (whole, src) => {
    const asset = findOutputAsset(src);
    if (!asset) return whole;
    // Shared data-URL scripts preserve chunk order while avoiding one copy of
    // every compiled Next.js chunk per route.
    const index = sharedAssetIndex("js", readFileSync(asset, "utf8"));
    return `<script src="__GLEAN_JS_${index}__"></script>`;
  });
}

function inlinePanel(html) {
  const panelPath = join(tempRoot, "public", "sites", "shizhi", "panel-demo.html");
  const panelScriptPath = join(tempRoot, "public", "sites", "shizhi", "glean.js");
  const panelSource = readFileSync(panelPath, "utf8");
  const panelScript = readFileSync(panelScriptPath, "utf8");
  const loaderStart = panelSource.indexOf('  const script = document.createElement("script");');
  const appendMarker = "  document.head.appendChild(script);";
  const appendEnd = panelSource.indexOf(appendMarker, loaderStart) + appendMarker.length;
  if (loaderStart < 0 || appendEnd < appendMarker.length) {
    throw new Error("Could not locate panel-demo dynamic loader");
  }
  const loaderBlock = panelSource.slice(loaderStart, appendEnd);
  const fitBlock = loaderBlock
    .replace(
      /  const script = document\.createElement\("script"\);\n  script\.src = [^;]+;\n  script\.onload = \(\) => \{\n/,
      "",
    )
    .replace(`\n  };\n${appendMarker}`, "");
  if (fitBlock.includes('createElement("script")') || fitBlock.includes("script.onload")) {
    throw new Error("Could not detach panel demo loader before inlining");
  }
  const panelWithoutLoader = panelSource.slice(0, loaderStart) + panelSource.slice(appendEnd);

  return html.replace(
    /<iframe\b([^>]*?)\bsrc=["']\/sites\/shizhi\/panel-demo\.html([^"']*)["']([^>]*)><\/iframe>/gi,
    (whole, before, query, after) => {
      const collapsed = new URLSearchParams(query.replace(/^\?/, "")).get("collapsed") ?? "1";
      const configuredFit = fitBlock.replace(
        'new URLSearchParams(location.search).get("collapsed")',
        JSON.stringify(collapsed),
      );
      const configuredPanel = panelWithoutLoader.replace(
        "</body>",
        `<script>${panelScript}</script><script>${configuredFit}</script></body>`,
      );
      const escapedSrcdoc = configuredPanel
        .replaceAll("&", "&amp;")
        .replaceAll("\"", "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
      return `<iframe data-offline-panel="true"${before}srcdoc="${escapedSrcdoc}"${after}></iframe>`;
    },
  );
}

function inlinePublicAssets(html) {
  // Mask scripts/styles first: Next serializes component markup and props in
  // inline Flight scripts, and replacing URLs inside those strings would copy
  // large GIF/PNG payloads multiple times.
  const blocks = [];
  const masked = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (block) => {
    const token = `__GLEAN_BLOCK_${blocks.length}__`;
    blocks.push(block);
    return token;
  });
  const replaced = masked.replace(/<(img|link|source)\b[^>]*>/gi, (tag) =>
    tag.replace(/\b(src|href)=("|')([^"']+)(\2)/gi, (whole, attr, quote, value) => {
      if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/_next/")) return whole;
      const asset = findPublicAsset(value);
      if (!asset) return whole;
      const index = sharedAssetIndex("images", dataUriFor(asset));
      return `${attr}=${quote}__GLEAN_IMG_${index}__${quote}`;
    }),
  );
  return replaced.replace(/__GLEAN_BLOCK_([0-9]+)__/g, (_, index) => blocks[Number(index)]);
}

function addOfflineNavigationBridge(html) {
  const bridge = `\n<script>\n(() => {\n  // React may reconcile the original iframe \`src\` back onto this exported
  // document. Preserve the embedded panel document across hydration.
  const repairPanels = () => {
    document.querySelectorAll("iframe[data-offline-panel]").forEach((frame) => {
      const saved = frame.dataset.offlineSrcdoc || frame.getAttribute("srcdoc");
      if (!saved) return;
      frame.dataset.offlineSrcdoc = saved;
      if (frame.getAttribute("srcdoc") !== saved) frame.setAttribute("srcdoc", saved);
    });
  };
  repairPanels();
  new MutationObserver(repairPanels).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["src", "srcdoc"] });

  const applyOfflineTheme = (value) => {
    const theme = value === "dark" ? "dark" : "light";
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.setAttribute("aria-checked", String(theme === "dark"));
    });
    window.dispatchEvent(new CustomEvent("shizhi:theme-change", { detail: theme }));
  };
  window.addEventListener("message", (event) => {
    if (event.source !== parent || event.data?.type !== "shizhi-theme") return;
    applyOfflineTheme(event.data.theme);
  });

  const routeFor = (href) => {\n    if (href === "/guide" || href === "/guide/") return { route: "guide" };\n    if (href.startsWith("/guide/")) {\n      const [rawPath, hash] = href.slice("/guide/".length).split("#");\n      const path = rawPath.replace(/\\/+$/, "");\n      return { route: path ? "guide/" + path : "guide", hash: hash || "" };\n    }\n    if (href === "/" || href.startsWith("/#")) {\n      return { route: "home", hash: href.split("#")[1] || "home" };\n    }\n    return null;\n  };\n  document.addEventListener("click", (event) => {\n    const target = event.target instanceof Element ? event.target : null;\n    if (!target) return;\n    const themeToggle = target.closest(".theme-toggle");\n    if (themeToggle) {\n      event.preventDefault();\n      event.stopImmediatePropagation();\n      const theme = document.documentElement.classList.contains("dark") ? "light" : "dark";\n      applyOfflineTheme(theme);\n      try { localStorage.setItem("shizhi-theme", theme); } catch {}\n      parent.postMessage({ type: "glean-offline-theme", theme }, "*");\n      return;\n    }\n    const anchor = target.closest("a");\n    if (!anchor) return;\n    const href = anchor.getAttribute("href");\n    if (!href) return;\n    const route = routeFor(href);\n    if (route) {\n      event.preventDefault();\n      event.stopImmediatePropagation();\n      parent.postMessage({ type: "glean-offline-route", ...route }, "*");\n    }\n  }, true);\n})();\n</script>`;
  return html.includes("</body>") ? html.replace("</body>", `${bridge}</body>`) : `${html}${bridge}`;
}

function preparePage(filePath) {
  let html = readFileSync(filePath, "utf8");
  html = inlineStyles(html);
  html = inlineScripts(html);
  html = inlinePanel(html);
  html = inlinePublicAssets(html);
  // Reveal is an enhancement in the original page. In a standalone export,
  // make the server-rendered content visible even if a browser delays or
  // declines a cross-document client-script during initial file:// loading.
  html = html.replace(
    "</head>",
    '<style id="glean-offline-reveal-fallback">.reveal{opacity:1!important;filter:none!important;transform:none!important}</style></head>',
  );
  html = addOfflineNavigationBridge(html);
  return html;
}

function routeFiles() {
  const out = join(tempRoot, "out");
  const routes = new Map([["home", join(out, "index.html")], ["guide", join(out, "guide", "index.html")]]);
  const guideDir = join(out, "guide");
  for (const entry of readdirSync(guideDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const page = join(guideDir, entry.name, "index.html");
      if (existsSync(page)) routes.set(`guide/${entry.name}`, page);
    }
  }
  return routes;
}

function buildWrapper(pages) {
  const pageData = Object.fromEntries(pages);
  const safeJson = (value) => JSON.stringify(value).replaceAll("</script", "<\\/script");
  const serialized = safeJson(pageData);
  const serializedAssets = safeJson({ css: sharedAssets.css, js: sharedAssets.js, images: sharedAssets.images });
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Glean · 拾知（离线版）</title>
<style>
  html, body { margin: 0; width: 100%; height: 100%; background: #f5f5f1; }
  body { overflow: hidden; }
  #offline-app, #offline-frames { width: 100%; height: 100%; }
  #offline-frames { position: relative; }
  .offline-frame { border: 0; display: none; width: 100%; height: 100%; }
  .offline-frame.is-active { display: block; }
  #offline-status { position: fixed; z-index: 10; right: 12px; bottom: 10px; padding: 5px 9px; border: 1px solid rgba(0,0,0,.12); border-radius: 999px; background: rgba(255,255,255,.78); color: #697064; font: 11px/1.2 system-ui, sans-serif; backdrop-filter: blur(10px); pointer-events: none; opacity: .8; }
  html.dark, html.dark body { background: #1b1b1f; }
  html.dark #offline-status { border-color: rgba(205,212,200,.16); background: rgba(25,25,28,.78); color: #a1ac91; }
  @media print { #offline-status { display: none; } .offline-frame { display: block !important; height: auto; min-height: 100vh; } }
</style>
</head>
<body>
<div id="offline-app"><div id="offline-frames"></div><div id="offline-status">离线版 · 无需网络</div></div>
<script>
const OFFLINE_PAGES = ${serialized};
const OFFLINE_ASSETS = ${serializedAssets};
const OFFLINE_URLS = { css: [], js: [] };
function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}
for (const [kind, type] of [["css", "text/css"], ["js", "text/javascript"]]) {
  // Data URLs are intentionally used instead of blob URLs: they also work
  // when the outer document is opened directly as file://, and do not depend
  // on the browser granting srcdoc access to a blob origin.
  OFFLINE_URLS[kind] = OFFLINE_ASSETS[kind].map((content) => "data:" + type + ";base64," + encodeBase64(content));
}
const frames = new Map();
function materializePage(page) {
  return page
    .replaceAll(/__GLEAN_CSS_([0-9]+)__/g, (_, index) => OFFLINE_URLS.css[Number(index)])
    .replaceAll(/__GLEAN_JS_([0-9]+)__/g, (_, index) => OFFLINE_URLS.js[Number(index)])
    .replaceAll(/__GLEAN_IMG_([0-9]+)__/g, (_, index) => OFFLINE_ASSETS.images[Number(index)]);
}
const frameHost = document.getElementById("offline-frames");
let activeRoute = "";
let currentTheme = (() => {
  try {
    const stored = localStorage.getItem("shizhi-theme");
    if (stored === "dark" || stored === "light") return stored;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
})();
function applyOuterTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}
applyOuterTheme(currentTheme);
function normalizeRoute(route) {
  const normalized = route?.replace(/\\/+$/, "") || "home";
  return OFFLINE_PAGES[normalized] ? normalized : "home";
}
function showRoute(route, hash = "") {
  route = normalizeRoute(route);
  let frame = frames.get(route);
  if (!frame) {
    frame = document.createElement("iframe");
    frame.className = "offline-frame";
    frame.title = route === "home" ? "Glean 首页" : "Glean 指南";
    frame.srcdoc = materializePage(OFFLINE_PAGES[route]);
    frame.addEventListener("load", () => {
      frame.contentWindow.postMessage({ type: "shizhi-theme", theme: currentTheme }, "*");
      if (hash) setTimeout(() => frame.contentWindow.location.hash = hash, 0);
    });
    frameHost.appendChild(frame);
    frames.set(route, frame);
  }
  for (const [key, item] of frames) item.classList.toggle("is-active", key === route);
  activeRoute = route;
  const targetHash = route === "home" && hash ? "#" + hash : "#" + route;
  if (location.hash !== targetHash) history.replaceState(null, "", targetHash);
  if (hash && frame.contentWindow) setTimeout(() => frame.contentWindow.location.hash = hash, 0);
}
window.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "glean-offline-route") showRoute(data.route, data.hash || "");
  if (data.type === "glean-offline-theme") {
    currentTheme = data.theme === "dark" ? "dark" : "light";
    applyOuterTheme(currentTheme);
    try { localStorage.setItem("shizhi-theme", currentTheme); } catch {}
    for (const frame of frames.values()) frame.contentWindow.postMessage({ type: "shizhi-theme", theme: currentTheme }, "*");
  }
});
window.addEventListener("hashchange", () => {
  const value = location.hash.slice(1);
  if (value === "home" || value.startsWith("home&")) return showRoute("home", value.split("&anchor=")[1] || "");
  showRoute(normalizeRoute(value));
});
showRoute(location.hash ? location.hash.slice(1) : "home");
</script>
</body>
</html>
`;
}

try {
  copyProject();
  runBuild();
  const pages = [...routeFiles()].map(([route, file]) => [route, preparePage(file)]);
  writeFileSync(outputPath, buildWrapper(pages), "utf8");
  console.log(`\nCreated ${outputPath}`);
  console.log(`Packed ${pages.length} routes into one offline HTML file.`);
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
