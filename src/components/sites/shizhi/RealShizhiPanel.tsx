"use client";

import { useCallback, useEffect, useRef } from "react";
import { THEME_EVENT } from "@/components/sites/shizhi/ThemeToggle";
import { withBasePath } from "@/lib/base-path";

interface RealShizhiPanelProps {
  compact?: boolean;
  expanded?: boolean;
}

type Theme = "light" | "dark";

export function RealShizhiPanel({ compact = false, expanded = false }: RealShizhiPanelProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const query = expanded ? "?collapsed=0" : "?collapsed=1";

  const syncTheme = useCallback((theme?: Theme) => {
    const currentTheme = theme ??
      (document.documentElement.classList.contains("dark") ? "dark" : "light");
    frameRef.current?.contentWindow?.postMessage(
      { type: "shizhi-theme", theme: currentTheme },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      syncTheme((event as CustomEvent<Theme>).detail);
    };

    window.addEventListener(THEME_EVENT, onThemeChange);
    syncTheme();
    return () => window.removeEventListener(THEME_EVENT, onThemeChange);
  }, [syncTheme]);

  return (
    <div className={`real-panel-shell ${compact ? "is-compact" : ""}`}>
      <iframe
        ref={frameRef}
        className="real-panel-frame"
        src={`${withBasePath("/sites/shizhi/panel-demo.html")}${query}`}
        title="拾知真实产品面板"
        loading={compact ? "eager" : "lazy"}
        onLoad={() => syncTheme()}
      />
    </div>
  );
}
