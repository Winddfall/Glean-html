# SponsorsFeatures Specification

## Overview
- Target: `src/components/sites/ccswitch-a1fc3ebb/zh-c8763bc2/SponsorsFeatures.tsx`
- Screenshots: `desktop-sweep-01.png`, `desktop-sweep-02.png`
- Interaction: static with hover/entrance states.

## Sponsor section
- Muted section background `rgba(62,58,50,.3)`, desktop padding 128px 0, height ~464px; mobile 64px 0, height ~304px.
- Max width 1024px, centered. Small orange icon/badge, heading `感谢赞助商的支持`, copy `如果您需要稳定、高性价比的 API 中转服务，欢迎了解一下 CC Switch 的赞助商。`, orange outlined/filled link `查看全部赞助商`.

## Feature section
- Background #23201a, desktop padding 128px 0; max width 1024px.
- Center heading `为什么选择 CC Switch?`; subtitle `一个应用管理供应商、路由、用量、会话和技能`.
- Stats row: `129.1k Stars`, `16.7M 下载`, `7 支持应用`, `Rust #1`. Use muted separators on desktop and wrapping grid on mobile.
- Six cards in 3x2 grid, gap 16–24px, warm dark surface, 1px border #463f38, radius 12–16px, padding 24px. Orange icon tile, h3 20/28 600, body 14–16 muted.
- Cards/content verbatim:
  1. 统一管理七大应用 — 一个界面管理 Claude Code、Claude Desktop、Codex、Gemini CLI、OpenCode、OpenClaw 和 Hermes Agent 的供应商配置。
  2. 自动故障转移 — 本地路由内置熔断器、健康监控和故障转移队列，主 Provider 异常时自动切换到备用 Provider。
  3. 用量与额度可见 — 实时追踪请求、Token、缓存命中、成本和订阅额度，支持日期范围筛选与自定义模型价格。
  4. 安全本地存储 — 所有配置和 API Key 安全存储在本地 SQLite 数据库，支持完整的 Schema 迁移。
  5. MCP / Skills / 会话 — 统一管理 MCP、Skills、Prompts、Hermes Memory 和跨应用会话恢复，无需手动编辑配置文件。
  6. 开源免费 — 基于 MIT 协议开源，完全免费使用。社区驱动开发，欢迎贡献代码和反馈。

## Responsive
- Desktop: 3 columns. Mobile: 1 column and compact 64px section padding; total feature height ~1600px.
