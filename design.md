# Design — MyTab

A locked design system for MyTab. Every UI and component implementation reads this file.

## Genre
`modern-minimal` + `tactile-workbench`

## Macrostructure Family
- Main View: Workbench (Focused central action, clean peripheral controls, breathing room)
- Modals & Drawers: Monolithic Sheet / Floating Island (No card-in-card nesting, hairline borders)

## Theme & Palette (OKLCH)

### Dark Mode (Deep Obsidian & Amber Micro-glow)
- `--color-paper`: oklch(0.14 0.015 250) /* Deep Obsidian background */
- `--color-paper-elevated`: oklch(0.18 0.018 250) /* Elevated surface */
- `--color-paper-card`: rgba(255, 255, 255, 0.07) /* Semi-translucent glass */
- `--color-paper-card-hover`: rgba(255, 255, 255, 0.12)
- `--color-ink`: oklch(0.96 0.005 250) /* Primary text */
- `--color-ink-muted`: oklch(0.68 0.02 250) /* Muted text */
- `--color-rule`: rgba(255, 255, 255, 0.10) /* Hairline border */
- `--color-rule-active`: rgba(255, 255, 255, 0.22) /* Focused / Active border */
- `--color-accent`: oklch(0.72 0.15 65) /* Warm Amber / Gold anchor accent */
- `--color-accent-subtle`: rgba(234, 179, 8, 0.15)
- `--color-focus`: oklch(0.78 0.14 65)

### Light Mode (Warm Paper & Deep Graphite)
- `--color-paper`: oklch(0.98 0.005 85) /* Warm paper white */
- `--color-paper-elevated`: oklch(0.95 0.008 85)
- `--color-paper-card`: rgba(255, 255, 255, 0.82)
- `--color-paper-card-hover`: rgba(255, 255, 255, 0.95)
- `--color-ink`: oklch(0.18 0.02 250) /* Deep graphite text */
- `--color-ink-muted`: oklch(0.48 0.02 250)
- `--color-rule`: rgba(0, 0, 0, 0.09)
- `--color-rule-active`: rgba(0, 0, 0, 0.22)
- `--color-accent`: oklch(0.55 0.16 65)
- `--color-accent-subtle`: rgba(202, 138, 4, 0.12)
- `--color-focus`: oklch(0.55 0.16 65)

## Typography
- Display (Time / Hero metrics): Tabular numerals, tracking-tight, font-feature-settings: "tnum" 1, "cv01" 1.
- Body (UI / Settings / Labels): Clean, modern sans-serif with 4-pt rhythm.
- Mono (Shortcuts / Keys / Status): Font-mono, tracking-wide for keys like `/`, `Esc`, `⌘K`.

## Spacing & Scale (4-pt Base)
- Spacing: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px.
- Radii: 
  - Cards: `1rem` (16px)
  - Inputs / Buttons: `0.75rem` (12px)
  - Floating Pills: `9999px`

## Motion & Microinteractions
- Ease: `cubic-bezier(0.16, 1, 0.3, 1)` (Exponential decay ease-out)
- Durations: Micro (120ms), Transition (200ms), Sheet (280ms)
- 8-State Compliance on all interactive controls:
  `default` · `hover` · `focus-visible` · `active` · `disabled` · `loading` · `error` · `success`
