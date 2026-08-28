# TestimonialsFaq Specification

## Overview
- Target: `src/components/sites/ccswitch-a1fc3ebb/zh-c8763bc2/TestimonialsFaq.tsx`
- Screenshots: `desktop-sweep-06.png`, `desktop-sweep-07.png`
- Interaction: time-driven marquee; click-driven accordion.

## Testimonials
- Muted section, desktop padding 128px 0, height ~868px, overflow clipped.
- Center heading `用户怎么说`, subtitle `来自开发者社区的反馈`.
- Two horizontal rows of dark quote cards, opposite/offset continuous marquee. Cards ~360x190, border, 12px radius, quote text 14px and avatar/name/role footer.
- Include at least these exact testimonials: 蛮吉/Vibe Coding 爱好者, 愚者/前字节跳动开发工程师, 军师/独立开发者, 荀彧/AI 产品经理, Mashiro/小农科技有限公司 前端架构师. Use verbatim quotes from extracted research JSON.
- Mobile can use a clipped single-column/slow horizontal strip while retaining section height ~864px.

## FAQ
- Background #23201a, max width 896px, desktop padding 128px 0, mobile 64px 24px.
- Heading `常见问题`, subtitle `有疑问？我们来解答`.
- Six border-bottom/dark-surface accordion rows. Button 16px mobile / 18px desktop, 500, y padding 20px. Chevron rotates when open. Only one item open.
- Questions/answers:
  1. CC Switch 是免费的吗？ — 是的，CC Switch 完全免费且开源。基于 MIT 协议发布，您可以自由使用、修改和分发。
  2. 支持哪些 AI 编程工具？ — 目前支持 Claude Code、Claude Desktop、Codex、Gemini CLI、OpenCode、OpenClaw 和 Hermes Agent，并为不同应用提供对应的供应商预设、配置写入和会话管理能力。
  3. 我的 API Key 安全吗？ — 绝对安全。所有 API Key 和配置信息都存储在您本地的 SQLite 数据库中，不会上传到任何服务器。
  4. 本地路由服务会影响请求速度吗？ — 影响微乎其微。本地路由服务基于 Rust 构建，性能很高，并额外提供格式转换、请求日志、健康监控和故障转移。
  5. 如何参与贡献？ — 欢迎通过 GitHub 提交 Issue 和 Pull Request。我们有详细的贡献指南，帮助您快速上手。
  6. 遇到问题如何获取帮助？ — 您可以通过 GitHub Issues 反馈问题，或者加入我们的 Discord 社区与其他用户交流。
