"use client";

import { useEffect, useRef } from "react";

/**
 * 全页面知识磁场：粒子、常驻关系网和鼠标吸引效果共用一个 Canvas。
 * Canvas 只负责装饰，不拦截页面交互；内容区块通过透明背景显示在知识场之上。
 */

const LABEL_TEXTS = [
  "需求拆解",
  "自动记录",
  "分析归档",
  "语义检索",
  "当前目标",
  "关键发现",
  "相关记录",
  "下一步",
  "输入补全",
  "用户画像",
  "本地知识库",
] as const;

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface Palette {
  brand: RGB;
  deep: RGB;
  ink: RGB;
  link: RGB;
}

const LIGHT_PALETTE: Palette = {
  brand: { r: 120, g: 150, b: 90 },
  deep: { r: 83, g: 108, b: 61 },
  ink: { r: 52, g: 67, b: 41 },
  link: { r: 126, g: 148, b: 110 },
};

const DARK_PALETTE: Palette = {
  brand: { r: 157, g: 187, b: 122 },
  deep: { r: 194, g: 215, b: 162 },
  ink: { r: 223, g: 223, b: 214 },
  link: { r: 157, g: 187, b: 122 },
};

const FIELD_RADIUS = 360;
const FOCUS_RADIUS = 190;
const LENS_RADIUS = 165;
const ACTIVE_LINK_RADIUS = 145;
const AMBIENT_LINK_RADIUS = 135;
const ACTIVE_LINK_MAX_ALPHA = 0.25;
const AMBIENT_LINK_MAX_ALPHA = 0.065;
const DPR_LIMIT = 2;
const FONT_STACK =
  'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

type ParticleKind = "dot" | "dash" | "ring" | "card" | "diamond" | "cross" | "spark";

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Particle {
  id: number;
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  kind: ParticleKind;
  baseAlpha: number;
  phase: number;
  driftSpeed: number;
  driftAmp: number;
  maxDisp: number;
  keep: number;
  spring: number;
  damp: number;
  att: number;
  attUp: number;
  attDown: number;
  rot: number;
  label: number;
  focus: number;
  focusUp: number;
  tw: number;
  md: number;
  nb: Array<[number, Particle]>;
}

interface Link {
  a: Particle;
  b: Particle;
  alpha: number;
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;
const rgba = (c: RGB, alpha: number) => `rgba(${c.r},${c.g},${c.b},${alpha})`;

const distToRect = (x: number, y: number, rect: Rect): number => {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
};

const rectsIntersect = (a: Rect, b: Rect): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const roundRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

export function KnowledgeField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const page = canvas.parentElement;
    if (!page) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let pageRect = page.getBoundingClientRect();
    let panelRect: Rect = { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 };
    let blockedRects: Rect[] = [];
    let particles: Particle[] = [];
    let ambientLinks: Link[] = [];
    const activeLinks = new Map<number, number>();
    const members: Particle[] = [];
    const candidates = new Set<number>();
    const visibleLabels: Particle[] = [];

    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, speed: 0, inside: false };
    const lens = { x: 0, y: 0, alpha: 0, seeded: false };
    let introStart = performance.now();
    let last = performance.now();
    let rafId = 0;
    let running = false;
    let visible = true;
    let panelBoost = 0;

    const palette = () =>
      document.documentElement.classList.contains("dark")
        ? DARK_PALETTE
        : LIGHT_PALETTE;
    const isAmbient = () => !finePointer || width < 768;
    const isTablet = () => finePointer && width >= 768 && width < 1024;

    const particleCount = (w: number, h: number) => {
      if (!finePointer || w < 768) return Math.min(42, Math.max(28, Math.round((w * h) / 50000)));
      return clamp(Math.round((w * h) / 48000), 90, 150);
    };

    const updateBlockedRects = () => {
      const hr = page.getBoundingClientRect();
      pageRect = hr;
      const panel = page.querySelector<HTMLElement>(".hero-panel-wrap");
      panelRect = panel
        ? (() => {
            const r = panel.getBoundingClientRect();
            return {
              left: r.left - hr.left,
              top: r.top - hr.top,
              right: r.right - hr.left,
              bottom: r.bottom - hr.top,
            };
          })()
        : { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 };

      blockedRects = Array.from(
        page.querySelectorAll<HTMLElement>(
          ".site-header, .hero-panel-wrap, .feature-card, .process-list article, .testimonial-grid article, .faq-list, .cta-card",
        ),
      ).map((element) => {
        const r = element.getBoundingClientRect();
        return {
          left: r.left - hr.left - 18,
          top: r.top - hr.top - 18,
          right: r.right - hr.left + 18,
          bottom: r.bottom - hr.top + 18,
        };
      });
    };

    const isBlocked = (x: number, y: number) =>
      blockedRects.some((rect) => x > rect.left && x < rect.right && y > rect.top && y < rect.bottom);

    const buildAmbientLinks = () => {
      ambientLinks = [];
      const maxLinks = width < 1024 ? 1 : 2;
      const byId = new Set<number>();
      for (const a of particles) {
        a.nb.length = 0;
        for (const b of particles) {
          if (a === b) continue;
          const distance = Math.hypot(a.hx - b.hx, a.hy - b.hy);
          if (distance < AMBIENT_LINK_RADIUS) a.nb.push([distance, b]);
        }
        a.nb.sort((left, right) => left[0] - right[0]);
        for (const [distance, b] of a.nb.slice(0, maxLinks)) {
          const low = Math.min(a.id, b.id);
          const high = Math.max(a.id, b.id);
          const key = low * 1000 + high;
          if (byId.has(key)) continue;
          byId.add(key);
          ambientLinks.push({
            a,
            b,
            alpha: AMBIENT_LINK_MAX_ALPHA * (1 - distance / AMBIENT_LINK_RADIUS),
          });
        }
      }
    };

    const buildParticles = () => {
      const count = particleCount(width, height);
      const kinds: ParticleKind[] = [
        "dot", "dot", "dot", "dot", "dot", "dot", "dot", "dot",
        "dash", "dash", "ring", "ring", "card", "diamond", "cross", "spark",
      ];
      const list: Particle[] = [];

      for (let i = 0; i < count; i++) {
        let hx = rnd(24, Math.max(25, width - 24));
        let hy = rnd(24, Math.max(25, height - 24));
        for (let attempt = 0; attempt < 60 && isBlocked(hx, hy); attempt++) {
          hx = rnd(24, Math.max(25, width - 24));
          hy = rnd(24, Math.max(25, height - 24));
        }
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        list.push({
          id: i,
          hx,
          hy,
          x: hx,
          y: hy,
          vx: 0,
          vy: 0,
          size: kind === "dot" ? rnd(1.1, 2.6) : rnd(1.7, 3.4),
          kind,
          baseAlpha: rnd(0.1, 0.19),
          phase: rnd(0, Math.PI * 2),
          driftSpeed: rnd(0.00016, 0.00052),
          driftAmp: rnd(2, 5),
          maxDisp: rnd(32, 72),
          keep: rnd(28, 52),
          spring: rnd(0.0032, 0.0052),
          damp: rnd(0.875, 0.92),
          att: 0,
          attUp: rnd(110, 260),
          attDown: rnd(900, 1500),
          rot: rnd(0, Math.PI),
          label: -1,
          focus: 0,
          focusUp: rnd(180, 300),
          tw: 0,
          md: 0,
          nb: [],
        });
      }

      const picked: Particle[] = [];
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      for (const particle of shuffled) {
        if (picked.length >= LABEL_TEXTS.length) break;
        if (particle.hx < 44 || particle.hx > width - 44 || particle.hy < 50 || particle.hy > height - 50) continue;
        if (picked.some((other) => Math.hypot(particle.hx - other.hx, particle.hy - other.hy) < 145)) continue;
        particle.label = picked.length;
        particle.kind = "ring";
        particle.size = rnd(2.5, 3.6);
        particle.baseAlpha = rnd(0.14, 0.22);
        picked.push(particle);
      }

      ctx.font = `650 11.5px ${FONT_STACK}`;
      picked.forEach((particle) => {
        particle.tw = ctx.measureText(LABEL_TEXTS[particle.label]).width;
      });
      particles = list;
      activeLinks.clear();
      buildAmbientLinks();
      introStart = performance.now();
    };

    const syncRunning = () => {
      const shouldRun = !reduced && visible && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        last = performance.now();
        rafId = requestAnimationFrame(frame);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    };

    const resize = () => {
      const r = page.getBoundingClientRect();
      pageRect = r;
      width = r.width;
      height = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateBlockedRects();
      buildParticles();
      if (reduced) drawStatic();
    };

    const updateLinks = (dt: number) => {
      const maxLinks = width < 1024 ? 2 : 3;
      candidates.clear();
      for (const a of members) {
        a.nb.length = 0;
        for (const b of members) {
          if (a === b) continue;
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < ACTIVE_LINK_RADIUS) a.nb.push([distance, b]);
        }
        a.nb.sort((left, right) => left[0] - right[0]);
        for (const [distance, b] of a.nb.slice(0, maxLinks)) {
          const low = Math.min(a.id, b.id);
          const high = Math.max(a.id, b.id);
          const key = low * 1000 + high;
          candidates.add(key);
          const target = (1 - distance / ACTIVE_LINK_RADIUS) * ACTIVE_LINK_MAX_ALPHA;
          const current = activeLinks.get(key) ?? 0;
          activeLinks.set(key, current + (target - current) * Math.min(1, dt / 150));
        }
      }
      for (const [key, alpha] of activeLinks) {
        if (!candidates.has(key)) {
          const next = alpha - dt / 720;
          if (next <= 0.003) activeLinks.delete(key);
          else activeLinks.set(key, next);
        }
      }
    };

    const update = (dt: number, time: number) => {
      const ambient = isAmbient();
      if (!ambient && mouse.inside) {
        const follow = 1 - Math.exp(-dt / 58);
        lens.x += (mouse.x - lens.x) * follow;
        lens.y += (mouse.y - lens.y) * follow;
        lens.alpha = Math.min(1, lens.alpha + dt / 260);
        const panelDistance = distToRect(mouse.x, mouse.y, panelRect);
        const boostTarget = panelDistance < 170 ? 1 : 0;
        panelBoost += (boostTarget - panelBoost) * Math.min(1, dt / (boostTarget ? 320 : 760));
      } else {
        lens.alpha = Math.max(0, lens.alpha - dt / 600);
        panelBoost = Math.max(0, panelBoost - dt / 760);
      }

      members.length = 0;
      if (!ambient && mouse.inside) {
        for (const particle of particles) {
          particle.md = Math.hypot(particle.x - mouse.x, particle.y - mouse.y);
          if (particle.md < FIELD_RADIUS) members.push(particle);
        }
      }

      for (const particle of particles) {
        const driftX = Math.sin(time * particle.driftSpeed + particle.phase) * particle.driftAmp;
        const driftY = Math.cos(time * particle.driftSpeed * 0.83 + particle.phase * 1.7) * particle.driftAmp;
        let targetX = particle.hx + driftX;
        let targetY = particle.hy + driftY;

        if (!ambient && mouse.inside) {
          const dx = mouse.x - targetX;
          const dy = mouse.y - targetY;
          const distance = Math.hypot(dx, dy);
          const attracted = distance < FIELD_RADIUS ? 1 : 0;
          particle.att = clamp(
            particle.att + (attracted - particle.att) * (attracted ? dt / particle.attUp : -dt / particle.attDown),
            0,
            1,
          );
          if (particle.att > 0.001 && distance > 1) {
            const proximity = 1 - distance / FIELD_RADIUS;
            const pull = Math.min(Math.max((distance - particle.keep) * (0.34 + 0.8 * proximity), 0), particle.maxDisp) * particle.att;
            targetX += (dx / distance) * pull;
            targetY += (dy / distance) * pull;
          }
        } else if (particle.att > 0) {
          particle.att = Math.max(0, particle.att - dt / particle.attDown);
        }

        if (isBlocked(targetX, targetY)) {
          targetX = particle.hx;
          targetY = particle.hy;
        }

        const scale = dt / 16.7;
        const damping = Math.pow(particle.damp, scale);
        particle.vx = (particle.vx + (targetX - particle.x) * particle.spring * scale) * damping;
        particle.vy = (particle.vy + (targetY - particle.y) * particle.spring * scale) * damping;
        particle.x += particle.vx * scale;
        particle.y += particle.vy * scale;

        if (particle.x > panelRect.left && particle.x < panelRect.right && particle.y > panelRect.top && particle.y < panelRect.bottom) {
          const left = particle.x - panelRect.left;
          const right = panelRect.right - particle.x;
          const top = particle.y - panelRect.top;
          const bottom = panelRect.bottom - particle.y;
          const nearest = Math.min(left, right, top, bottom);
          if (nearest === left) particle.x = panelRect.left;
          else if (nearest === right) particle.x = panelRect.right;
          else if (nearest === top) particle.y = panelRect.top;
          else particle.y = panelRect.bottom;
        }

        if (particle.label >= 0) {
          const inLens = !ambient && lens.alpha > 0.05 && Math.hypot(lens.x - particle.x, lens.y - particle.y) < LENS_RADIUS;
          particle.focus = clamp(particle.focus + (inLens ? dt / particle.focusUp : -dt / 420), 0, 1);
        }
      }

      if (!ambient && mouse.inside) updateLinks(dt);
      else {
        for (const [key, alpha] of activeLinks) {
          const next = alpha - dt / 850;
          if (next <= 0.003) activeLinks.delete(key);
          else activeLinks.set(key, next);
        }
      }
    };

    const drawParticle = (particle: Particle, alpha: number) => {
      const colors = palette();
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.strokeStyle = rgba(colors.deep, alpha);
      ctx.fillStyle = rgba(colors.deep, alpha);
      ctx.lineWidth = Math.max(0.8, particle.size * 0.65);

      if (particle.kind === "dot") {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.kind === "dash") {
        ctx.rotate(particle.rot);
        ctx.beginPath();
        ctx.moveTo(-particle.size * 3.2, 0);
        ctx.lineTo(particle.size * 3.2, 0);
        ctx.stroke();
      } else if (particle.kind === "ring") {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 2.35, 0, Math.PI * 2);
        ctx.stroke();
      } else if (particle.kind === "card") {
        roundRectPath(ctx, -particle.size * 3, -particle.size * 2, particle.size * 6, particle.size * 4, 2);
        ctx.stroke();
      } else if (particle.kind === "diamond") {
        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-particle.size * 1.5, -particle.size * 1.5, particle.size * 3, particle.size * 3);
      } else if (particle.kind === "cross") {
        ctx.beginPath();
        ctx.moveTo(-particle.size * 2.5, 0);
        ctx.lineTo(particle.size * 2.5, 0);
        ctx.moveTo(0, -particle.size * 2.5);
        ctx.lineTo(0, particle.size * 2.5);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -particle.size * 3.2);
        ctx.lineTo(particle.size * 0.8, -particle.size * 0.8);
        ctx.lineTo(particle.size * 3.2, 0);
        ctx.lineTo(particle.size * 0.8, particle.size * 0.8);
        ctx.lineTo(0, particle.size * 3.2);
        ctx.lineTo(-particle.size * 0.8, particle.size * 0.8);
        ctx.lineTo(-particle.size * 3.2, 0);
        ctx.lineTo(-particle.size * 0.8, -particle.size * 0.8);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawLinks = (time: number, ease: number) => {
      const colors = palette();
      ctx.lineWidth = 1;
      for (const link of ambientLinks) {
        const pulse = 0.86 + Math.sin(time * 0.0007 + link.a.phase) * 0.14;
        ctx.strokeStyle = rgba(colors.link, link.alpha * pulse * ease);
        ctx.beginPath();
        ctx.moveTo(link.a.x, link.a.y);
        ctx.lineTo(link.b.x, link.b.y);
        ctx.stroke();
      }
      for (const [key, alpha] of activeLinks) {
        const a = particles[Math.floor(key / 1000)];
        const b = particles[key % 1000];
        if (!a || !b) continue;
        ctx.strokeStyle = rgba(colors.link, alpha * ease);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    };

    const drawLabels = (ease: number) => {
      const colors = palette();
      visibleLabels.length = 0;
      for (const particle of particles) {
        if (particle.label >= 0 && particle.focus > 0.01) visibleLabels.push(particle);
      }
      visibleLabels.sort((a, b) => b.focus - a.focus);
      const maxShow = isTablet() ? 3 : 6;
      ctx.font = `650 11.5px ${FONT_STACK}`;
      ctx.textBaseline = "middle";

      for (const particle of visibleLabels.slice(0, maxShow)) {
        const alpha = Math.min(1, particle.focus * 1.15) * ease;
        const text = LABEL_TEXTS[particle.label];
        const padding = 10;
        const labelHeight = 24;
        const labelWidth = particle.tw + padding * 2;
        let labelX = particle.x + 12;
        let labelY = particle.y - 12 - labelHeight;
        let above = true;
        if (labelX + labelWidth > width - 8) labelX = particle.x - 12 - labelWidth;
        if (labelX < 8) labelX = clamp(labelX, 8, width - labelWidth - 8);
        if (labelY < 8) {
          labelY = particle.y + 12;
          above = false;
        }
        if (labelY + labelHeight > height - 8) labelY = particle.y - 12 - labelHeight;

        const labelRect: Rect = { left: labelX, top: labelY, right: labelX + labelWidth, bottom: labelY + labelHeight };
        if (rectsIntersect(labelRect, panelRect) || blockedRects.some((rect) => rectsIntersect(labelRect, rect))) continue;

        ctx.save();
        const centerX = labelX + labelWidth / 2;
        const centerY = labelY + labelHeight / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(0.92 + 0.08 * particle.focus, 0.92 + 0.08 * particle.focus);
        ctx.translate(-centerX, -centerY);
        ctx.strokeStyle = rgba(colors.brand, 0.55 * alpha);
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(clamp(particle.x, labelX, labelX + labelWidth), above ? labelY + labelHeight : labelY);
        ctx.stroke();
        ctx.fillStyle = rgba(document.documentElement.classList.contains("dark") ? { r: 27, g: 33, b: 20 } : { r: 255, g: 255, b: 255 }, 0.9 * alpha);
        roundRectPath(ctx, labelX, labelY, labelWidth, labelHeight, 7);
        ctx.fill();
        ctx.strokeStyle = rgba(colors.brand, 0.55 * alpha);
        roundRectPath(ctx, labelX, labelY, labelWidth, labelHeight, 7);
        ctx.stroke();
        ctx.fillStyle = rgba(colors.ink, 0.95 * alpha);
        ctx.textAlign = "left";
        ctx.fillText(text, labelX + padding, labelY + labelHeight / 2 + 0.5);
        ctx.restore();
      }
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const link of ambientLinks) {
        ctx.strokeStyle = rgba(palette().link, link.alpha);
        ctx.beginPath();
        ctx.moveTo(link.a.x, link.a.y);
        ctx.lineTo(link.b.x, link.b.y);
        ctx.stroke();
      }
      for (const particle of particles) drawParticle(particle, Math.min(0.2, particle.baseAlpha * 1.25));
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const colors = palette();
      const ambient = isAmbient();
      const intro = Math.min(1, (time - introStart) / 1600);
      const ease = ambient ? 1 : intro * intro * (3 - 2 * intro);

      if (!ambient && lens.alpha > 0.01) {
        const gradient = ctx.createRadialGradient(lens.x, lens.y, 0, lens.x, lens.y, LENS_RADIUS);
        gradient.addColorStop(0, rgba(colors.brand, 0.19 * lens.alpha));
        gradient.addColorStop(0.55, rgba(colors.brand, 0.08 * lens.alpha));
        gradient.addColorStop(1, rgba(colors.brand, 0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, LENS_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgba(colors.brand, 0.14 * lens.alpha);
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, LENS_RADIUS * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      drawLinks(time, ease);
      for (const particle of particles) {
        let alpha = particle.baseAlpha * ease;
        if (!ambient && lens.alpha > 0.01) {
          const distance = Math.hypot(lens.x - particle.x, lens.y - particle.y);
          if (distance < FIELD_RADIUS) alpha += (1 - distance / FIELD_RADIUS) * 0.17 * lens.alpha;
          if (distance < FOCUS_RADIUS) alpha += (1 - distance / FOCUS_RADIUS) * 0.1 * lens.alpha;
        }
        if (particle.label >= 0) alpha += particle.focus * 0.52;
        if (particle.att > 0.01) alpha += Math.min(0.12, particle.att * 0.08);
        drawParticle(particle, Math.min(alpha, 0.58));
      }
      if (!ambient) drawLabels(ease);
    };

    const frame = (time: number) => {
      if (!running) return;
      const dt = Math.min(48, time - last);
      last = time;
      update(dt, time);
      draw(time);
      rafId = requestAnimationFrame(frame);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      const x = event.clientX - pageRect.left;
      const y = event.clientY - pageRect.top;
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      if (mouse.inside && Number.isFinite(dx) && Number.isFinite(dy)) {
        mouse.vx = mouse.vx * 0.72 + dx * 0.28;
        mouse.vy = mouse.vy * 0.72 + dy * 0.28;
        mouse.speed = Math.min(1, Math.hypot(mouse.vx, mouse.vy) / 40);
      }
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
      mouse.speed = 0;
    };
    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) onPointerLeave();
    };
    const onScroll = () => {
      updateBlockedRects();
    };
    const onVisibility = () => syncRunning();
    const onResize = () => resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncRunning();
    }, { threshold: 0.01 });
    io.observe(page);

    const rectTimer = window.setInterval(updateBlockedRects, 600);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("mouseout", onMouseOut, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(page);

    resize();
    syncRunning();

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      io.disconnect();
      resizeObserver.disconnect();
      window.clearInterval(rectTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("blur", onPointerLeave);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="knowledge-field" aria-hidden="true" />;
}
