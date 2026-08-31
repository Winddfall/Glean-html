# HeaderHero Specification

## Overview
- Target: `src/components/sites/shizhi/HeaderHero.tsx`
- Screenshot: `desktop-sweep-00.png`
- Interaction: fixed scroll-reactive header; click-driven app switcher; mobile menu.

## Exact layout/styles
- Page background `rgb(35,32,26)`, foreground `rgb(231,225,218)`, Inter stack.
- Header fixed top, z-index high, height 80px, full width. Inner max-width 1200px, horizontal padding 24px. Transparent at y=0; after scrolling: `rgba(35,32,26,.8)`, blur 24px, 1px subtle border/shadow.
- Desktop brand uses 32px logo and bold `CC Switch`; nav links: 首页、文档、攻略、更新日志、赞助商、免费下载. Right controls: language pill, moon button, GitHub icon. Mobile hides link row and shows hamburger.
- Hero desktop height 750px and top padding 80px. Two-column grid, left ~39%, right ~61%, vertically centered. Warm orange radial glow behind.
- Badge is rounded full, muted orange surface, 14px text: `🎉 v3.20.0 正式发布`.
- H1 row uses 48px logo and `CC Switch`; desktop text 60/60, 700. Subtitle is 24–28px muted foreground.
- Primary button orange, white, h48, radius 8; secondary transparent with border. Platform line 13px muted.
- Product window dark #18191d, rounded ~20px, subtle border/shadow. Top macOS dots, toolbar, 7 app icons, provider rows.

## Product states
- Claude Code default rows: PackyCode, MiniMax, Anthropic, OpenRouter.
- Codex rows: PackyCode, MiniMax, OpenRouter, OpenAI.
- Other app names must remain clickable and visually select; data can be concise.
- Selected tab receives raised dark background/shadow; content fades quickly (~200ms).

## Responsive
- Mobile 390: header 64px; desktop nav hidden; hero height ~577px; centered copy; H1 ~36px; product window not shown; buttons compact and centered.
- Tablet: centered hero copy with mockup hidden or below when space permits.

## Assets/text
- Logo `/sites/ccswitch-a1fc3ebb/zh-c8763bc2/cc-switch-logo.png`.
- All text above is verbatim.
