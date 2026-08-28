"use client";

import { useEffect, useRef } from "react";

/**
 * 「知识磁场 + 检索透镜」首屏鼠标追踪动效。
 *
 * 全部绘制在单个 Canvas 上，pointer-events: none，位于文案与真实拾知面板之下。
 * 表达：用户在信息世界中移动时，拾知从噪音中识别相关内容，并围绕目标建立知识联系。
 *
 * 性能：requestAnimationFrame + DPR≤2 + 视口外暂停 + prefers-reduced-motion 降级。
 */

const LABEL_TEXTS = [
  "知识检索",
  "产品调研",
  "用户洞察",
  "内容增长",
  "当前目标",
  "关键发现",
  "相关记录",
  "下一步",
  "相关度 92%",
  "已关联目标",
  "3 条相似记录",
] as const;

interface RGB {
  r: number;
  g: number;
  b: number;
}

const BRAND: RGB = { r: 120, g: 150, b: 90 }; // #78965A 抹茶绿
const DEEP: RGB = { r: 83, g: 108, b: 61 }; // #536C3D 深绿
const INK: RGB = { r: 52, g: 67, b: 41 }; // #344329 墨绿
const LINK: RGB = { r: 126, g: 148, b: 110 }; // 半透明灰绿连接线

const FIELD_RADIUS = 200; // 知识磁场半径 180~240
const LENS_RADIUS = 152; // 检索透镜半径 150~160
const LINK_RADIUS = 108; // 连接距离 90~120
const LINK_MAX_ALPHA = 0.3; // 连接线最大透明度（≤0.3）
const DPR_LIMIT = 2;
const FONT_STACK =
  'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

const rgba = (c: RGB, a: number) => `rgba(${c.r},${c.g},${c.b},${a})`;

type ParticleKind = "dot" | "dash" | "ring" | "card";

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Particle {
  id: number;
  hx: number;
  hy: number; // 静止归位坐标
  x: number;
  y: number; // 当前坐标
  vx: number;
  vy: number;
  size: number;
  kind: ParticleKind;
  baseAlpha: number; // 0.06~0.12
  phase: number;
  driftSpeed: number;
  driftAmp: number; // 漂浮幅度 2~4.5
  maxDisp: number; // 最大位移 20~55
  keep: number; // 距鼠标中心的保留空白
  spring: number;
  damp: number;
  att: number; // 吸引量 0..1
  attUp: number; // 吸引响应时间常数（ms）
  attDown: number; // 恢复时间常数（ms）
  rot: number; // dash 朝向
  label: number; // 标签文本索引，-1 表示无
  focus: number; // 标签显现量 0..1
  focusUp: number; // 显现响应时间常数（ms）
  tw: number; // 标签文字宽度
  // 复用的临时字段，避免每帧分配新对象
  md: number; // 距鼠标距离缓存
  nb: Array<[number, Particle]>; // 候选邻居
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

const distToRect = (x: number, y: number, r: Rect): number => {
  const dx = Math.max(r.left - x, 0, x - r.right);
  const dy = Math.max(r.top - y, 0, y - r.bottom);
  return Math.hypot(dx, dy);
};

const rectsIntersect = (a: Rect, b: Rect): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const roundRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
};

export function KnowledgeField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hero = canvas.parentElement;
    if (!hero) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let panelRect: Rect = { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 };
    let heroRect = hero.getBoundingClientRect();

    const mouse = { x: -9999, y: -9999, inside: false };
    const lens = { x: 0, y: 0, alpha: 0, seeded: false };
    let panelBoost = 0;
    let introStart = performance.now();
    let rafId = 0;
    let running = false;
    let visible = true;
    let last = performance.now();

    const links = new Map<number, number>();
    const members: Particle[] = [];
    const candidates = new Set<number>();
    const labelVisible: Particle[] = [];
    const panelExtend: Array<[Particle, number]> = [];

    const isAmbient = () => !finePointer || width < 768;
    const isTablet = () => finePointer && width >= 768 && width < 1024;
    const maxLinksPerNode = () => (width < 1024 ? 1 : 2);

    const particleCount = (w: number) => {
      if (w >= 1440) return 66;
      if (w >= 1200) return 60;
      if (w >= 1024) return 52;
      if (w >= 768) return 44;
      return 26;
    };

    const updatePanelRect = () => {
      const panel = hero.querySelector<HTMLElement>(".hero-panel-wrap");
      const hr = hero.getBoundingClientRect();
      heroRect = hr;
      if (!panel) {
        panelRect = { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 };
        return;
      }
      const pr = panel.getBoundingClientRect();
      panelRect = {
        left: pr.left - hr.left,
        top: pr.top - hr.top,
        right: pr.right - hr.left,
        bottom: pr.bottom - hr.top,
      };
    };

    const insidePanelMargin = (x: number, y: number, m: number) =>
      x > panelRect.left - m &&
      x < panelRect.right + m &&
      y > panelRect.top - m &&
      y < panelRect.bottom + m;

    const buildParticles = () => {
      const ambient = isAmbient();
      const count = ambient
        ? Math.min(30, particleCount(width))
        : particleCount(width);
      const list: Particle[] = [];
      const kinds: ParticleKind[] = ["dot", "dot", "dot", "dot", "dot", "dot", "dot", "dash", "ring", "card"];

      for (let i = 0; i < count; i++) {
        let hx = 0;
        let hy = 0;
        let ok = false;
        for (let attempt = 0; attempt < 24 && !ok; attempt++) {
          hx = rnd(28, width - 28);
          hy = rnd(28, height - 28);
          // 面板避让：归位坐标远离面板（含留白）
          if (insidePanelMargin(hx, hy, 26)) continue;
          ok = true;
        }
        if (!ok) continue;

        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        list.push({
          id: i,
          hx,
          hy,
          x: hx,
          y: hy,
          vx: 0,
          vy: 0,
          size: kind === "dot" ? rnd(1.0, 2.2) : rnd(1.5, 2.7),
          kind,
          baseAlpha: rnd(0.09, 0.17),
          phase: rnd(0, Math.PI * 2),
          driftSpeed: rnd(0.00018, 0.00065),
          driftAmp: rnd(2, 4.5),
          maxDisp: rnd(30, 62),
          keep: rnd(30, 50),
          spring: rnd(0.0032, 0.005),
          damp: rnd(0.875, 0.92),
          att: 0,
          attUp: rnd(120, 280),
          attDown: rnd(800, 1400),
          rot: rnd(0, Math.PI),
          label: -1,
          focus: 0,
          focusUp: rnd(180, 300),
          tw: 0,
          md: 0,
          nb: [],
        });
      }

      // 挑选知识节点：均匀分散、远离面板、彼此间隔，最多 11 个
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      const picked: Particle[] = [];
      for (const p of shuffled) {
        if (picked.length >= LABEL_TEXTS.length) break;
        if (insidePanelMargin(p.hx, p.hy, 40)) continue;
        if (p.hx < 44 || p.hx > width - 44 || p.hy < 50 || p.hy > height - 50)
          continue;
        let tooClose = false;
        for (const q of picked) {
          if (Math.hypot(p.hx - q.hx, p.hy - q.hy) < 210) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) continue;
        picked.push(p);
      }
      picked.forEach((p, i) => {
        p.label = i;
        p.kind = "ring";
        p.size = rnd(2.4, 3.2);
        p.baseAlpha = rnd(0.12, 0.2);
      });

      // 预测量标签文字宽度
      ctx.font = `650 11.5px ${FONT_STACK}`;
      picked.forEach((p) => {
        p.tw = ctx.measureText(LABEL_TEXTS[p.label]).width;
      });

      particles = list;
      introStart = performance.now();
    };

    const syncRunning = () => {
      const want = !reduced && visible && !document.hidden;
      if (want && !running) {
        running = true;
        last = performance.now();
        rafId = requestAnimationFrame(frame);
      } else if (!want && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    };

    const resize = () => {
      const r = hero.getBoundingClientRect();
      heroRect = r;
      width = r.width;
      height = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updatePanelRect();
      buildParticles();
      if (reduced) drawStatic();
    };

    // —— 物理与状态更新 ——————————————————————————————

    const update = (dt: number, t: number) => {
      const ambient = isAmbient();

      if (!ambient) {
        if (mouse.inside) {
          // 透镜柔和跟随：以鼠标为圆心，约 60ms 时间常数轻柔跟随
          const k = 1 - Math.exp(-dt / 58);
          lens.x += (mouse.x - lens.x) * k;
          lens.y += (mouse.y - lens.y) * k;
          lens.alpha = Math.min(1, lens.alpha + dt / 300);
        } else {
          lens.alpha = Math.max(0, lens.alpha - dt / 520);
        }

        // 面板接近时的轻微增强
        const dPanel = mouse.inside
          ? distToRect(mouse.x, mouse.y, panelRect)
          : Infinity;
        const boostT = dPanel < 150 ? 1 : 0;
        panelBoost += (boostT - panelBoost) * Math.min(1, dt / (boostT ? 320 : 760));
      } else {
        panelBoost = 0;
      }

      members.length = 0;
      if (!ambient && mouse.inside) {
        for (const p of particles) {
          p.md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (p.md < FIELD_RADIUS) members.push(p);
        }
      }

      for (const p of particles) {
        // 自主缓慢漂浮，幅度受限
        const dx = Math.sin(t * p.driftSpeed + p.phase) * p.driftAmp;
        const dy = Math.cos(t * p.driftSpeed * 0.83 + p.phase * 1.7) * p.driftAmp;
        let tx = p.hx + dx;
        let ty = p.hy + dy;

        if (!ambient && mouse.inside) {
          const ddx = mouse.x - tx;
          const ddy = mouse.y - ty;
          const d = Math.hypot(ddx, ddy);
          const attT = d < FIELD_RADIUS ? 1 : 0;
          p.att = clamp(
            p.att + (attT - p.att) * (attT ? dt / p.attUp : -dt / p.attDown),
            0,
            1
          );
          if (p.att > 0.001 && d > 1) {
          const prox = 1 - d / FIELD_RADIUS;
          // 环绕式聚集：保留鼠标中心空白，位移受最大值约束
          const pull =
            Math.min(Math.max((d - p.keep) * (0.42 + 0.85 * prox), 0), p.maxDisp) *
            p.att;
            tx += (ddx / d) * pull;
            ty += (ddy / d) * pull;
          }
        } else if (p.att > 0) {
          p.att = Math.max(0, p.att - dt / p.attDown);
        }

        // 弹簧 + 阻尼，避免线性动画
        const s = dt / 16.7;
        const damping = Math.pow(p.damp, s);
        p.vx = (p.vx + (tx - p.x) * p.spring * s) * damping;
        p.vy = (p.vy + (ty - p.y) * p.spring * s) * damping;
        p.x += p.vx * s;
        p.y += p.vy * s;

        // 粒子不得穿透面板内容
        if (
          p.x > panelRect.left &&
          p.x < panelRect.right &&
          p.y > panelRect.top &&
          p.y < panelRect.bottom
        ) {
          const l = p.x - panelRect.left;
          const rr = panelRect.right - p.x;
          const tp = p.y - panelRect.top;
          const b = panelRect.bottom - p.y;
          const m = Math.min(l, rr, tp, b);
          if (m === l) p.x = panelRect.left;
          else if (m === rr) p.x = panelRect.right;
          else if (m === tp) p.y = panelRect.top;
          else p.y = panelRect.bottom;
        }

        // 知识节点显现量
        if (p.label >= 0) {
          const inLens =
            !ambient &&
            lens.alpha > 0.05 &&
            Math.hypot(lens.x - p.x, lens.y - p.y) < LENS_RADIUS * 0.95;
          p.focus = clamp(
            p.focus + (inLens ? dt / p.focusUp : -dt / 380),
            0,
            1
          );
        }
      }

      if (!ambient) updateLinks(dt);
      else links.clear();
    };

    const updateLinks = (dt: number) => {
      const maxLinks = maxLinksPerNode();
      candidates.clear();

      for (const a of members) {
        a.nb.length = 0;
        for (const b of members) {
          if (a === b) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_RADIUS) a.nb.push([d, b]);
        }
        a.nb.sort((x, y) => x[0] - y[0]);
        for (let k = 0; k < Math.min(maxLinks, a.nb.length); k++) {
          const [d, b] = a.nb[k];
          const key = a.id < b.id ? a.id * 1000 + b.id : b.id * 1000 + a.id;
          candidates.add(key);
          const target = (1 - d / LINK_RADIUS) * LINK_MAX_ALPHA;
          const cur = links.get(key) ?? 0;
          // 出现约 180~300ms
          links.set(key, cur + (target - cur) * Math.min(1, dt / 180));
        }
      }

      // 离开检索范围后 300~600ms 淡出
      for (const [key, v] of links) {
        if (!candidates.has(key)) {
          const nv = v - dt / 470;
          if (nv <= 0.004) links.delete(key);
          else links.set(key, nv);
        }
      }
    };

    // —— 绘制 ——————————————————————————————

    const drawParticle = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.kind === "dot") {
        ctx.fillStyle = rgba(DEEP, alpha);
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === "dash") {
        ctx.rotate(p.rot);
        ctx.strokeStyle = rgba(DEEP, alpha);
        ctx.lineWidth = Math.max(0.8, p.size * 0.7);
        ctx.beginPath();
        ctx.moveTo(-p.size * 3.2, 0);
        ctx.lineTo(p.size * 3.2, 0);
        ctx.stroke();
      } else if (p.kind === "ring") {
        ctx.strokeStyle = rgba(DEEP, alpha);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 2.3, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = rgba(DEEP, alpha * 0.9);
        ctx.lineWidth = 1;
        roundRectPath(ctx, -p.size * 3, -p.size * 2, p.size * 6, p.size * 4, 2);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawStatic = () => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) drawParticle(p, Math.min(0.16, p.baseAlpha * 1.4));
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const ambient = isAmbient();
      const intro = Math.min(1, (now - introStart) / 1600);
      const ease = ambient ? 1 : intro * intro * (3 - 2 * intro);

      // 面板背后的绿色光场轻微增强
      if (panelBoost > 0.01 && panelRect.right > panelRect.left) {
        const cx = (panelRect.left + panelRect.right) / 2;
        const cy = (panelRect.top + panelRect.bottom) / 2;
        const pr = Math.max(
          panelRect.right - panelRect.left,
          panelRect.bottom - panelRect.top
        ) * 0.75;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr);
        g.addColorStop(0, rgba(BRAND, 0.13 * panelBoost));
        g.addColorStop(1, rgba(BRAND, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      // 检索透镜：极淡的抹茶绿径向光场
      if (lens.alpha > 0.01) {
        const g = ctx.createRadialGradient(
          lens.x,
          lens.y,
          0,
          lens.x,
          lens.y,
          LENS_RADIUS
        );
        g.addColorStop(0, rgba(BRAND, 0.18 * lens.alpha));
        g.addColorStop(0.55, rgba(BRAND, 0.08 * lens.alpha));
        g.addColorStop(1, rgba(BRAND, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, LENS_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        // 透明度极低的扫描环，非雷达感
        ctx.strokeStyle = rgba(BRAND, 0.12 * lens.alpha);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, LENS_RADIUS * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 知识连接线：半透明灰绿色，随距离衰减
      ctx.lineWidth = 1;
      for (const [key, v] of links) {
        const a = particles[Math.floor(key / 1000)];
        const b = particles[key % 1000];
        if (!a || !b) continue;
        ctx.strokeStyle = rgba(LINK, v * ease);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // 面板方向延伸的极少量连接线
      if (panelBoost > 0.02) {
        panelExtend.length = 0;
        for (const p of particles) {
          const d = distToRect(p.x, p.y, panelRect);
          if (d < 170) panelExtend.push([p, d]);
        }
        panelExtend.sort((x, y) => x[1] - y[1]);
        const n = Math.min(3, panelExtend.length);
        for (let i = 0; i < n; i++) {
          const [p] = panelExtend[i];
          const tx = clamp(p.x, panelRect.left, panelRect.right);
          const ty = clamp(p.y, panelRect.top, panelRect.bottom);
          ctx.strokeStyle = rgba(BRAND, 0.1 * panelBoost * ease);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
      }

      // 知识粒子
      for (const p of particles) {
        let a = p.baseAlpha * ease;
        if (!ambient) {
          if (lens.alpha > 0.01) {
            const dl = Math.hypot(lens.x - p.x, lens.y - p.y);
            if (dl < LENS_RADIUS) a += (1 - dl / LENS_RADIUS) * 0.22 * lens.alpha;
          }
          if (panelBoost > 0.01 && distToRect(p.x, p.y, panelRect) < 120)
            a += 0.08 * panelBoost;
        }
        if (p.label >= 0) a += p.focus * 0.55;
        drawParticle(p, Math.min(a, 0.55));
      }

      // 知识信息显现：最多 2~4 个标签
      if (!ambient) drawLabels(ease);
    };

    const drawLabels = (ease: number) => {
      labelVisible.length = 0;
      for (const p of particles) {
        if (p.label >= 0 && p.focus > 0.01) labelVisible.push(p);
      }
      labelVisible.sort((a, b) => b.focus - a.focus);
      const maxShow = isTablet() ? 2 : 4;

      ctx.font = `650 11.5px ${FONT_STACK}`;
      ctx.textBaseline = "middle";

      for (let i = 0; i < Math.min(maxShow, labelVisible.length); i++) {
        const p = labelVisible[i];
        const a = Math.min(1, p.focus * 1.15) * ease;
        if (a < 0.01) continue;
        const text = LABEL_TEXTS[p.label];
        const padX = 10;
        const h = 24;
        const w = p.tw + padX * 2;

        // 默认置于节点右上方，节点与标签保持 8~12px 距离
        let tagX = p.x + 12;
        let tagY = p.y - 12 - h;
        let above = true;

        // 出界则翻向左侧
        if (tagX + w > width - 8) tagX = p.x - 12 - w;
        if (tagX < 8) tagX = clamp(tagX, 8, width - w - 8);
        if (tagY < 8) {
          tagY = p.y + 12;
          above = false;
        }
        if (tagY + h > height - 8) tagY = p.y - 12 - h;

        // 尽量不与面板重叠
        const tagRect: Rect = { left: tagX, top: tagY, right: tagX + w, bottom: tagY + h };
        if (rectsIntersect(tagRect, panelRect)) {
          tagX = p.x - 12 - w;
          tagRect.left = tagX;
          tagRect.right = tagX + w;
          if (rectsIntersect(tagRect, panelRect) || tagX < 8) continue;
        }

        ctx.save();
        // 微弱缩放显现，模拟由模糊到清晰
        const scale = 0.92 + 0.08 * p.focus;
        const cx = tagX + w / 2;
        const cy = tagY + h / 2;
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);

        // 连接细线
        const nodeCx = p.x;
        const nodeCy = p.y;
        ctx.strokeStyle = rgba(BRAND, 0.55 * a);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodeCx, nodeCy);
        ctx.lineTo(
          clamp(nodeCx, tagX, tagX + w),
          above ? tagY + h : tagY
        );
        ctx.stroke();

        // 标签：半透明白色底 + 极淡抹茶绿边框
        ctx.fillStyle = `rgba(255,255,255,${0.92 * a})`;
        roundRectPath(ctx, tagX, tagY, w, h, 7);
        ctx.fill();
        ctx.strokeStyle = rgba(BRAND, 0.55 * a);
        ctx.lineWidth = 1.2;
        roundRectPath(ctx, tagX, tagY, w, h, 7);
        ctx.stroke();

        // 关键词文字
        ctx.fillStyle = rgba(INK, 0.95 * a);
        ctx.textAlign = "left";
        ctx.fillText(text, tagX + padX, tagY + h / 2 + 0.5);
        ctx.restore();
      }
    };

    // —— 主循环 ——————————————————————————————

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(48, now - last);
      last = now;
      update(dt, now);
      draw(now);
      rafId = requestAnimationFrame(frame);
    };

    // —— 事件 ——————————————————————————————

    // 在 window 上跟踪指针并按 hero 坐标系判定，确保透镜始终以鼠标为圆心
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const x = e.clientX - heroRect.left;
      const y = e.clientY - heroRect.top;
      mouse.x = x;
      mouse.y = y;
      mouse.inside = x >= 0 && x <= width && y >= 0 && y <= height;
      if (mouse.inside && !lens.seeded) {
        lens.x = x;
        lens.y = y;
        lens.seeded = true;
      }
    };
    const onPointerLeave = () => {
      mouse.inside = false;
    };
    const onWindowMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) mouse.inside = false;
    };
    const onScroll = () => {
      heroRect = hero.getBoundingClientRect();
      updatePanelRect();
    };
    const onVisibility = () => syncRunning();
    const onResize = () => resize();

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        syncRunning();
      },
      { threshold: 0.02 }
    );
    io.observe(hero);

    // 周期性刷新面板坐标（兼容 Reveal 动画与滚动后的布局变化）
    const rectTimer = window.setInterval(() => {
      updatePanelRect();
    }, 600);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("mouseout", onWindowMouseOut, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    const ro = new ResizeObserver(onResize);
    ro.observe(hero);

    resize();
    syncRunning();

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      window.clearInterval(rectTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mouseout", onWindowMouseOut);
      window.removeEventListener("blur", onPointerLeave);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="knowledge-field"
      aria-hidden="true"
    />
  );
}
