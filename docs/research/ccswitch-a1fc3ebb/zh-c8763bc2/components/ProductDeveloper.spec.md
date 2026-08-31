# ProductDeveloper Specification

## Overview
- Target: `src/components/sites/shizhi/ProductDeveloper.tsx`
- Screenshots: `desktop-sweep-03.png`, `desktop-sweep-04.png`, `desktop-sweep-05.png`
- Interaction: showcase pill selection; static developer benefits.

## Product showcase
- Muted section background, desktop padding 128px 0 and height ~1144px.
- Center heading `直观的操作界面`, subtitle `七应用切换、工具栏和本地路由状态一眼可见`.
- Three pills: Provider 管理 (active orange), 本地路由, 使用统计.
- Large dark application mockup (max-width ~980px) with macOS window header and provider-management UI matching hero, rounded 18px, deep shadow, blue selected row. Reuse the embedded `RealShizhiPanel` implementation.
- On mobile stack within 884px section; mockup scales down without horizontal overflow.

## Developer section
- Background #23201a, desktop padding 128px 0, two columns.
- Left badge `开发者友好`, heading `零配置，开箱即用` at 36/40 600, paragraph verbatim.
- Code window with title `~/.claude/settings.json`, mac dots, Fira Code green syntax, exact snippet:
  `{ "env": { "ANTHROPIC_AUTH_TOKEN": "PROXY_MANAGED", "ANTHROPIC_BASE_URL": "http://127.0.0.1:15721" } }`
- Right has three rows with colored square icons:
  - SQLite 数据持久化 — 所有配置存储在本地 SQLite 数据库，安全可靠，支持完整的 Schema 迁移。
  - Rust 后端 + React 前端 — 基于 Tauri 2.x 构建，结合 Rust 的性能和 React 的灵活性。
  - 智能用量追踪 — 实时监控 Token、缓存、订阅额度和费用，按应用与 Provider 分类统计分析。
- Mobile stacks left then benefits; 64px padding.
