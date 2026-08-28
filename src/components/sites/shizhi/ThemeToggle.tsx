"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "shizhi-theme";
export const THEME_EVENT = "shizhi:theme-change";

// SSR 阶段 useLayoutEffect 不会执行，降级为 useEffect 避免警告
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Theme = "light" | "dark";

const getTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

function applyTheme(theme: Theme, persist: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* 隐私模式等场景下静默忽略 */
    }
  }
  // 广播给页面上其他切换按钮与画布动效，保持状态同步
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
}

/**
 * 「昼夜之境」主题切换按钮。
 *
 * 视觉完全由 html.dark 类驱动（纯 CSS 过渡），因此 SSR / 水合渲染结果始终一致，
 * 不会有图标闪烁或水合不匹配；内联脚本（见 layout.tsx）在首帧前完成初始主题。
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useIsomorphicLayoutEffect(() => {
    // 开发环境 StrictMode 重挂载会重置 <html> 的属性，这里按来源重新应用；生产环境为无操作。
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const theme: Theme =
        stored === "dark" || stored === "light"
          ? stored
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.style.colorScheme = theme;
      setDark(theme === "dark");

      // 用户未手动选择过时，跟随系统深浅模式实时切换
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const onSystemChange = (event: MediaQueryListEvent) => {
        if (localStorage.getItem(STORAGE_KEY)) return;
        applyTheme(event.matches ? "dark" : "light", false);
      };
      media.addEventListener("change", onSystemChange);
      return () => media.removeEventListener("change", onSystemChange);
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    const onThemeChange = (event: Event) =>
      setDark((event as CustomEvent<Theme>).detail === "dark");
    window.addEventListener(THEME_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_EVENT, onThemeChange);
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="切换深浅颜色主题"
      title="切换深浅主题"
      className={`theme-toggle ${className}`}
      onClick={() => applyTheme(getTheme() === "dark" ? "light" : "dark", true)}
    >
      <span className="tt-track" aria-hidden="true" />
      <span className="tt-thumb" aria-hidden="true">
        <svg
          className="tt-icon tt-icon-sun"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
          <path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M5.2 18.8l1.4-1.4M17.4 6.6l1.4-1.4" />
        </svg>
        <svg className="tt-icon tt-icon-moon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.7 14.3A9.2 9.2 0 1 1 9.7 3.3a7.4 7.4 0 0 0 11 11Z" />
        </svg>
      </span>
    </button>
  );
}
