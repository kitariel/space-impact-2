# IMPACT_01 — design and implementation

## Workflow → UX → implementation

1. Establish tokens and an original hardware identity.
2. Build a deterministic, independently testable Canvas game simulation.
3. Give the hero terminal a live attract mode and direct quick play.
4. Add scoped Anime.js motion, a device-entry route transition, and editorial sections.
5. Adapt the composition and input for small screens; verify keyboard and reduced motion.
6. Test gameplay, browser behavior, all routes, and production output.

## Visual decisions

Graphite industrial hardware, sage LCD, off-white editorial grotesk, fine instrument typography. The device is drawn in CSS and SVG; all game sprites are original programmatic matrices. No stock graphics, copyrighted game assets, UI kits, remote fonts, or video.

Research: [DesEngs](https://desengs.com/), [Design Spells](https://designspells.com/), [Transitions.dev](https://transitions.dev/), [Magic UI](https://magicui.design/), and [gradient borders](https://gradient-border.floriankiem.com/). Selected ideas: origin-aware transitions, sliding indicators, precise hover feedback, masked typography, and fine edge lighting. Implemented directly with CSS and Anime.js; none of these libraries are installed.

Animation uses [Anime.js React scopes](https://animejs.com/documentation/getting-started/using-with-react/) with teardown, media-query matching, scroll observers, timelines, springs, and SVG drawing. Large motion is slow; game input is immediate. Reduced motion disables decorative loops, tilt, and large transitions.

## Gameplay

384 × 216 logical pixels. One 2–4 minute mission. Three shields, five enemy classes, asteroid hazards, score-based double/spread upgrades, collectible repair cells, and a rechargeable EMP. Warning at 130 seconds; three-core boss at 140 seconds. Simulation uses a fixed 60 Hz timestep, capped catch-up, seeded randomness, and no React state for entities. React receives a small HUD snapshot at 8 Hz.

## Boundaries

Everything lives in this project. No accounts, database, external score service, telemetry, or backend. Settings and best score use `impact_01_settings`. Storage failure gracefully falls back to in-memory defaults. Audio is quiet, generated locally, and unlocked only by user interaction.
