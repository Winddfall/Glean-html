"use client";

import { useState } from "react";
import {
  BookOpen,
  Clock3,
  GripVertical,
  History,
  Link2,
  PanelRight,
  Plus,
  RefreshCw,
  Settings,
} from "lucide-react";
import type { AppState, Provider } from "./types";

const appStates: AppState[] = [
  { name: "Claude Code", short: "✺", color: "#d45d35", providers: [
    { name: "PackyCode", url: "https://www.packyapi.ai", active: true, accent: "#8f9bb3", timeAgo: "10 分钟前", usage: [{ t: "已使用: 672  剩余: " }, { t: "66 USD", strong: true }] },
    { name: "MiniMax", url: "https://platform.minimaxi.com", accent: "#d43d6a", timeAgo: "2 分钟前", usage: [{ t: "5h: " }, { t: "43%", green: true }, { t: "  2h40m   7d: " }, { t: "12%", green: true }, { t: "  6d" }] },
    { name: "Anthropic", url: "https://www.anthropic.com/claude-code", accent: "#bd7b46", timeAgo: "1 分钟前", usage: [{ t: "5h: " }, { t: "36%", green: true }, { t: "  2h10m  7d: " }, { t: "64%", green: true }, { t: "  3d8h" }] },
    { name: "OpenRouter", url: "https://openrouter.ai", accent: "#665bd9" },
  ]},
  { name: "Claude Desktop", short: "◉", color: "#bd7b46", providers: [
    { name: "Official", url: "https://claude.ai/download", active: true, accent: "#d97757" },
    { name: "PatewayAI", url: "https://pateway.ai", accent: "#4f7ec8", timeAgo: "5 分钟前", usage: [{ t: "5h: " }, { t: "31%", green: true }, { t: "  3h22m  7d: " }, { t: "18%", green: true }, { t: "  2d4h" }] },
    { name: "ClaudeAPI", url: "https://www.apito.ai", accent: "#915bc1" },
    { name: "Codex OAuth", url: "Account provider via Local Routing", accent: "#4a9d79" },
  ]},
  { name: "Codex", short: "◌", color: "#4fc3a1", providers: [
    { name: "PackyCode", url: "https://www.packyapi.ai", active: true, accent: "#8f9bb3", timeAgo: "10 分钟前", usage: [{ t: "已使用: 128  剩余: " }, { t: "372 USD", strong: true }] },
    { name: "MiniMax", url: "https://platform.minimaxi.com", accent: "#d43d6a", timeAgo: "2 分钟前", usage: [{ t: "5h: " }, { t: "58%", green: true }, { t: "  1h14m  7d: " }, { t: "21%", green: true }, { t: "  1d9h" }] },
    { name: "OpenRouter", url: "https://openrouter.ai", accent: "#665bd9" },
    { name: "OpenAI", url: "https://chatgpt.com/codex", accent: "#d9d9d9" },
  ]},
  { name: "Gemini", short: "✦", color: "#4d8bf5", providers: [
    { name: "PackyCode", url: "https://www.packyapi.ai", active: true, accent: "#8f9bb3", timeAgo: "10 分钟前", usage: [{ t: "已使用: 256  剩余: " }, { t: "744 USD", strong: true }] },
    { name: "MiniMax", url: "https://platform.minimaxi.com", accent: "#d43d6a", timeAgo: "2 分钟前", usage: [{ t: "5h: " }, { t: "49%", green: true }, { t: "  2h51m  7d: " }, { t: "18%", green: true }] },
    { name: "Google AI", url: "https://ai.google.dev/", accent: "#4285f4" },
    { name: "OpenRouter", url: "https://openrouter.ai", accent: "#665bd9" },
  ]},
  { name: "OpenCode", short: "▣", color: "#e8e8e8", providers: [
    { name: "Oh My OpenCode", url: "github.com/code-yeongyu/oh-my-openagent", active: true, accent: "#ed8b32" },
    { name: "TheRouter", url: "https://therouter.ai", accent: "#55a6d8" },
    { name: "PackyCode", url: "https://www.packyapi.ai", accent: "#8f9bb3" },
    { name: "StepFun", url: "https://platform.stepfun.com/step-plan", accent: "#7157c8" },
  ]},
  { name: "OpenClaw", short: "◆", color: "#ef5d4c", providers: [
    { name: "OpenClaw Default", url: "https://github.com/openclaw/openclaw", active: true, accent: "#ef5d4c" },
    { name: "LionCCAPI", url: "https://vibecodingapi.ai", accent: "#ca8249" },
    { name: "MiniMax", url: "https://platform.minimaxi.com", accent: "#d43d6a", timeAgo: "2 分钟前", usage: [{ t: "5h: " }, { t: "72%", green: true }, { t: "  48m  7d: " }, { t: "27%", green: true }] },
    { name: "Shengsuanyun", url: "https://www.shengsuanyun.com", accent: "#4f8b65" },
  ]},
  { name: "Hermes", short: "H", color: "#e8b55d", providers: [
    { name: "Hermes Agent", url: "https://nousresearch.com/hermes-agent/", active: true, accent: "#e8b55d" },
    { name: "Zhipu GLM", url: "https://open.bigmodel.cn", accent: "#4c87db" },
    { name: "OpenRouter", url: "https://openrouter.ai", accent: "#665bd9" },
    { name: "Nous Research", url: "https://nousresearch.com", accent: "#9d75cf" },
  ]},
];

function UsageLine({ provider }: { provider: Provider }) {
  if (!provider.usage && !provider.timeAgo) return null;
  return (
    <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
      {provider.timeAgo && (
        <span className="flex items-center gap-1.5 text-[10px] leading-none text-[#a1a1aa]/70">
          <Clock3 className="h-3 w-3" />
          {provider.timeAgo}
          <RefreshCw className="h-3 w-3" />
        </span>
      )}
      {provider.usage && (
        <span className="text-xs leading-none text-[#a1a1aa]">
          {provider.usage.map((part, i) => (
            <span key={i} className={part.green ? "font-semibold text-[#33cc6b]" : part.strong ? "font-semibold text-[#fafafa]" : undefined}>{part.t}</span>
          ))}
        </span>
      )}
    </div>
  );
}

export function AppMockup() {
  const [active, setActive] = useState(0);
  const current = appStates[active];
  return (
    <div className="w-[998px] max-w-full overflow-hidden rounded-2xl border border-[#3a3a40] bg-[#1d1d20] shadow-2xl shadow-black/50">
      <div className="flex h-9 items-center gap-2 border-b border-white/5 bg-[#232327] px-3.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex items-center justify-between gap-4 border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-semibold text-[#60a5fa]">CC Switch</span>
          <Settings className="h-4 w-4 text-white/35" />
          <span className="relative h-5 w-9 rounded-full bg-[#3a3a40]"><span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white" /></span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-lg bg-[#27272b] px-1.5 py-1">
            {appStates.map((app, index) => (
              <button key={app.name} type="button" aria-label={app.name} onClick={() => setActive(index)}
                className={`grid h-7 w-7 place-items-center rounded-md text-[13px] font-bold transition ${active === index ? "bg-white/10 shadow" : "opacity-55 hover:bg-white/5 hover:opacity-90"}`}
                style={{ color: app.color }}>{app.short}</button>
            ))}
          </div>
          <div className="hidden items-center gap-3 rounded-lg bg-[#27272b] px-3 py-2 text-white/40 md:flex">
            <Link2 className="h-3.5 w-3.5" /><BookOpen className="h-3.5 w-3.5" /><History className="h-3.5 w-3.5" /><PanelRight className="h-3.5 w-3.5" />
          </div>
          <button aria-label="添加供应商" className="grid h-8 w-8 place-items-center rounded-full bg-[#d45d35] text-white shadow-lg shadow-[#d45d35]/25"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="space-y-3 p-4">
        {current.providers.map((provider) => (
          <div key={`${current.name}-${provider.name}`}
            className={`flex h-[82px] items-center gap-3 rounded-2xl border p-4 ${provider.active ? "border-[#3b82f6]/60 bg-[#27272b] shadow-[0_1px_2px_rgba(59,130,246,.1)]" : "border-[#3a3a40] bg-[#232326]"}`}>
            <GripVertical className="h-4 w-4 shrink-0 text-white/15" />
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xs font-bold" style={{ backgroundColor: `${provider.accent}26`, color: provider.accent }}>{provider.name.slice(0, 2)}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-semibold leading-6 text-[#fafafa]">{provider.name}</div>
              <div className="mt-1 truncate text-sm leading-5 text-[#60a5fa]">{provider.url}</div>
            </div>
            <UsageLine provider={provider} />
          </div>
        ))}
        <div className="h-[148px]" aria-hidden />
      </div>
    </div>
  );
}
