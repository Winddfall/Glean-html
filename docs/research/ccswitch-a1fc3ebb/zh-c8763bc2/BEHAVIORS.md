# Behaviors

- Header is fixed at the top. At scrollY 0 it is transparent with no blur/shadow; after the page scrolls it becomes `rgba(35,32,26,.8)` with `backdrop-filter: blur(24px)` and a subtle 1px bottom shadow/border. Height is 80–81px.
- Hero product mockup is click-driven. Seven app icon buttons switch provider rows: Claude Code, Claude Desktop, Codex, Gemini, OpenCode, OpenClaw, Hermes. Transition is a quick opacity/content swap; selected icon receives background, foreground, and shadow.
- Hero and section content use entrance animations triggered as they enter the viewport (fade/translate). They must settle to opacity 1; no scroll snapping or smooth-scroll library was detected.
- Feature cards and buttons have color/border lift hover states. Navigation links brighten on hover.
- Testimonials are time-driven horizontal marquee rows on desktop; clipped stacked cards on small screens. Animation repeats continuously.
- FAQ is click-driven single-open accordion. Chevron rotates 180 degrees and content expands/collapses with an approximately 200ms transition.
- Theme toggle exists in the header; the inspected state is dark and the clone should default to that exact dark palette. Mobile navigation collapses into a menu button below the desktop breakpoint.
- Responsive breakpoints observed: desktop navigation/layout at 1024px+, stacked/mobile layouts below ~768px, compact section padding (`64px 0`) on mobile versus `128px 0` on desktop.
