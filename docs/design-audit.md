# 🏛 HIKMAH SCHOOL — DIGITAL SIGNATURE
## Official Style Audit, Design System & Interaction Philosophy
### Version 2.0 — Production Standard · Maxed Edition

---

> *"Excellence is not a style choice. It is the only standard."*
> — Hikmah School Design Doctrine

---

## TABLE OF CONTENTS

1. [Brand Personality & Philosophy](#i-brand-personality--philosophy)
2. [Visual Identity Signature](#ii-visual-identity-signature)
3. [Design Token System](#iii-design-token-system)
4. [Color System](#iv-color-system)
5. [Typography System](#v-typography-system)
6. [Spacing & Grid System](#vi-spacing--grid-system)
7. [Component Standards](#vii-component-standards)
8. [Micro-Interaction Philosophy](#viii-micro-interaction-philosophy)
9. [Page Architecture](#ix-page-architecture)
10. [RTL & Arabic Standards](#x-rtl--arabic-standards)
11. [Accessibility Standards](#xi-accessibility-standards)
12. [Empty, Error & Loading States](#xii-empty-error--loading-states)
13. [Modal & Overlay Rules](#xiii-modal--overlay-rules)
14. [Navigation Architecture](#xiv-navigation-architecture)
15. [Forbidden Patterns](#xv-forbidden-patterns)
16. [AI Prompt Library](#xvi-ai-prompt-library)
17. [Client Handoff Checklist](#xvii-client-handoff-checklist)
18. [Changelog](#xviii-changelog)

---

## I. BRAND PERSONALITY & PHILOSOPHY

### Core Identity

Hikmah School is a serious academic institution. Every pixel must reflect that seriousness. The platform is not a product — it is an environment. Users do not "use" it; they operate within it.

### Personality Attributes

| ✅ IS | ❌ IS NOT |
|---|---|
| Refined | Playful |
| Disciplined | Trendy |
| Academic | Neon |
| Calm | Startup-y |
| Authoritative | Over-animated |
| Structured | Loud |
| Timeless | Colorful for decoration |
| High-trust | Gamified |
| Institutional | Consumer-grade |
| Restrained | Busy |

### The Platform Must Feel Like

- A **premium university portal** — Oxford, not Duolingo
- A **Ministry-level system** — serious, civic, reliable
- A **private institution with heritage** — weight and permanence
- **Apple-level restraint** — every element earns its place
- An **editorial publication** — typography-led, not icon-led

### The Foundational Question

Before any design decision, ask:
> *"Would a 40-year-old academic administrator feel respected by this interface?"*

If the answer is no — redesign it.

---

## II. VISUAL IDENTITY SIGNATURE

These five principles are the core of the visual system. They are non-negotiable.

### Principle 1 — White Authority

- Backgrounds are **white**.
- White is the **dominant** surface.
- Space is **intentional**, not accidental.
- Content breathes.
- No heavy background fills. No colored backgrounds for entire pages.
- Secondary surfaces: `#FAFAFA` or `#F7F7F5` (warm off-white), never pure grey.

> *White is not emptiness. White is authority.*

---

### Principle 2 — The Soft Frame Rule

Every major content block must feel contained but not caged.

```
Border:  1px solid #E8E8E8 (neutral, cool, never warm)
Shadow:  0 1px 3px rgba(0,0,0,0.06)   ← default
         0 2px 8px rgba(0,0,0,0.08)   ← hover
Radius:  6px standard / 4px compact / 8px modal
```

- No aggressive borders.
- No raised card clutter.
- No dark borders unless indicating active state.

---

### Principle 3 — Hierarchy Over Decoration

We structure. We do not decorate.

Hierarchy is built through:
- **Spacing** — proximity and distance communicate relationship
- **Font weight** — 400 body, 500 label, 600 heading, 700 only for page titles
- **Alignment** — strict grid, no floating orphaned elements
- **Scale** — scale is relative and deliberate, never arbitrary
- **Color value** — muted text for secondary, not bold color contrasts

Never achieved through:
- Gradients on text or backgrounds
- Icon overload
- Random accent color deployment
- Badge or tag decoration

---

### Principle 4 — Restrained Color

Color is **semantic**. Every color communicates a specific meaning.

| Color Role | Meaning | When to Use |
|---|---|---|
| Primary Blue | Authority, action | Buttons, active states, links |
| Deep Navy | Gravitas, headings | Page titles, sidebar branding |
| Success Green | Positive outcomes | Grades, attendance ✓, completion |
| Alert Red | Danger, missing | Errors, failures, warnings |
| Amber | Attention | Deadlines, pending states |
| Muted Subject Tones | Identity per subject | Subject cards only, subtle |
| Neutral Grey Scale | Structure | Borders, labels, secondary text |

**Forbidden:**
- Random color assignment
- Glowing or luminous effects
- Intense gradients on UI elements
- Color for celebration (confetti, bright flashes)

---

### Principle 5 — Institutional Gravity

The platform must have **weight**. Weight is achieved by:

- Consistent vertical rhythm
- Titles that anchor pages
- Alignment to an invisible 8pt grid
- Purposeful negative space before and after sections
- Never starting a page with a card — always a clear title and context line first

---

## III. DESIGN TOKEN SYSTEM

Design tokens are the single source of truth for all visual values. Every implementation must reference these tokens — never hardcode values.

### Color Tokens

```css
/* ── BACKGROUND ── */
--color-bg-base:        #FFFFFF;
--color-bg-subtle:      #FAFAFA;
--color-bg-muted:       #F5F5F3;
--color-bg-overlay:     rgba(0, 0, 0, 0.40);

/* ── BORDER ── */
--color-border-subtle:  #EEEEEE;
--color-border-default: #E2E2E2;
--color-border-strong:  #CCCCCC;
--color-border-focus:   #1A3A6B;

/* ── PRIMARY ── */
--color-primary-900:    #0D2449;
--color-primary-800:    #1A3A6B;
--color-primary-700:    #1E4A87;
--color-primary-600:    #2159A0;
--color-primary-500:    #2968B8;  /* ← default interactive blue */
--color-primary-400:    #4A85CC;
--color-primary-100:    #EBF2FA;
--color-primary-050:    #F4F8FD;

/* ── SUCCESS ── */
--color-success-600:    #1A6B3A;
--color-success-500:    #217A44;
--color-success-100:    #E8F5EE;

/* ── DANGER ── */
--color-danger-600:     #8B1A1A;
--color-danger-500:     #C0392B;
--color-danger-100:     #FDECEA;

/* ── AMBER ── */
--color-amber-600:      #7A4A00;
--color-amber-500:      #E07B00;
--color-amber-100:      #FEF5E7;

/* ── NEUTRAL ── */
--color-neutral-900:    #111111;
--color-neutral-800:    #222222;
--color-neutral-700:    #333333;
--color-neutral-600:    #555555;
--color-neutral-500:    #777777;
--color-neutral-400:    #999999;
--color-neutral-300:    #BBBBBB;
--color-neutral-200:    #DDDDDD;
--color-neutral-100:    #F0F0F0;
--color-neutral-050:    #F8F8F8;
```

### Shadow Tokens

```css
--shadow-none:     none;
--shadow-subtle:   0 1px 3px rgba(0,0,0,0.06);
--shadow-soft:     0 2px 8px rgba(0,0,0,0.08);
--shadow-medium:   0 4px 16px rgba(0,0,0,0.10);
--shadow-modal:    0 8px 32px rgba(0,0,0,0.12);
--shadow-focus:    0 0 0 3px rgba(41,104,184,0.20);
```

### Radius Tokens

```css
--radius-sm:   4px;   /* compact elements: badges, tags */
--radius-md:   6px;   /* default cards, inputs */
--radius-lg:   8px;   /* modals, large panels */
--radius-xl:   12px;  /* reserved — use sparingly */
--radius-full: 9999px; /* pills only */
```

### Transition Tokens

```css
--transition-fast:   150ms ease-out;
--transition-base:   180ms ease-out;
--transition-slow:   250ms ease-out;
--transition-modal:  200ms cubic-bezier(0.16, 1, 0.3, 1);
```

---

## IV. COLOR SYSTEM

### Usage Rules by Context

**Backgrounds**

```
Page background     → --color-bg-base       (#FFFFFF)
Section background  → --color-bg-subtle     (#FAFAFA)
Inset content       → --color-bg-muted      (#F5F5F3)
Hover state bg      → --color-primary-050   (#F4F8FD)
Active state bg     → --color-primary-100   (#EBF2FA)
```

**Text Hierarchy**

```
Page title          → --color-neutral-900   (#111111)  weight 700
Section heading     → --color-neutral-800   (#222222)  weight 600
Body / paragraph    → --color-neutral-700   (#333333)  weight 400
Label / caption     → --color-neutral-500   (#777777)  weight 400/500
Placeholder         → --color-neutral-400   (#999999)  weight 400
Disabled            → --color-neutral-300   (#BBBBBB)  weight 400
Link                → --color-primary-600   (#2159A0)
Link hover          → --color-primary-800   (#1A3A6B)
```

**Semantic States**

```
Success text        → --color-success-600
Success background  → --color-success-100
Danger text         → --color-danger-600
Danger background   → --color-danger-100
Warning text        → --color-amber-600
Warning background  → --color-amber-100
```

### Subject Color Identity (Muted)

Each subject has one identity accent. Used **only** on subject-specific cards and indicators. Never used as full backgrounds or primary UI colors.

```
Mathematics     → Soft indigo      #E8E8F5
Arabic Language → Warm gold        #F5F0E8
Islamic Studies → Calming teal     #E8F3F0
Science         → Natural green    #EAF3E8
English         → Classic blue     #E8EFF5
History         → Aged amber       #F5F0E4
```

---

## V. TYPOGRAPHY SYSTEM

Typography is the single most powerful tool for institutional tone. It must be handled with precision.

### Font Stacks

```css
/* ── LATIN (Primary Interface) ── */
--font-display:   'Playfair Display', 'Georgia', serif;
--font-body:      'Source Serif 4', 'Georgia', serif;
--font-ui:        'DM Sans', 'Helvetica Neue', sans-serif;
--font-mono:      'DM Mono', 'Courier New', monospace;

/* ── ARABIC (RTL Interface) ── */
--font-arabic:    'Noto Naskh Arabic', 'Amiri', 'Traditional Arabic', serif;
--font-arabic-ui: 'IBM Plex Arabic', 'Segoe UI', sans-serif;
```

> **Rationale:** Playfair Display carries institutional gravitas for display text. DM Sans is readable and restrained for UI labels. Source Serif 4 brings editorial quality to body content.

### Type Scale

```css
--text-xs:    11px / line-height: 1.5  / tracking: 0.03em
--text-sm:    13px / line-height: 1.6  / tracking: 0.01em
--text-base:  15px / line-height: 1.7  / tracking: 0
--text-md:    17px / line-height: 1.6  / tracking: -0.01em
--text-lg:    20px / line-height: 1.5  / tracking: -0.01em
--text-xl:    24px / line-height: 1.4  / tracking: -0.02em
--text-2xl:   30px / line-height: 1.3  / tracking: -0.02em
--text-3xl:   36px / line-height: 1.2  / tracking: -0.03em
--text-4xl:   48px / line-height: 1.1  / tracking: -0.03em
```

### Semantic Type Roles

| Role | Size | Weight | Font | Color |
|---|---|---|---|---|
| Page Title | 30–36px | 700 | Display | neutral-900 |
| Section Heading | 20–24px | 600 | UI | neutral-800 |
| Card Title | 15–17px | 600 | UI | neutral-800 |
| Body Text | 15px | 400 | Body | neutral-700 |
| Label | 13px | 500 | UI | neutral-600 |
| Caption | 11–12px | 400 | UI | neutral-500 |
| Button | 13–14px | 500 | UI | (varies) |
| Nav Item | 13px | 500 | UI | neutral-600 |
| Badge | 11px | 600 | UI | (semantic) |
| Table Header | 11px | 600 | UI | neutral-500, uppercase, tracking wide |

### Typography Rules

- **Line height** is never below 1.4 for any readable text
- **Letter spacing** only negative for large titles; slightly positive for small caps/labels
- **No text-transform: uppercase** except table column headers and badge labels
- **No mixed fonts** within a single component
- **Arabic text** always uses Arabic font stack — never rendered in Latin fonts
- **Numbers** in data contexts should use `font-variant-numeric: tabular-nums`
- **Maximum line length**: 65–72 characters for body text blocks

---

## VI. SPACING & GRID SYSTEM

### Base Grid

```
Base unit:    8px
Grid:         12-column, 24px gutter
Max content:  1200px
Page padding: 48px horizontal (desktop) / 24px (tablet) / 16px (mobile)
```

### Spacing Scale

```css
--space-1:   4px    /* micro spacing: icon-text gap */
--space-2:   8px    /* tight: inline elements */
--space-3:   12px   /* compact: list item padding */
--space-4:   16px   /* default: component padding */
--space-5:   20px   /* relaxed: card body padding */
--space-6:   24px   /* section gap (small) */
--space-8:   32px   /* section gap (default) */
--space-10:  40px   /* between major groups */
--space-12:  48px   /* section separator */
--space-16:  64px   /* major page sections */
--space-20:  80px   /* hero / top-of-page breathing */
--space-24:  96px   /* maximum vertical separation */
```

### Spacing Application Rules

```
Page top margin before first title:   48–64px
Between page title and first section: 24–32px
Between sections on a page:           40–48px
Card internal padding:                20–24px
Form field gap:                       16px
Table row height:                     48px minimum
Button padding:                       10px 20px (default) / 8px 16px (compact)
Modal padding:                        32px
Sidebar width:                        240px (expanded) / 64px (collapsed)
```

### Vertical Rhythm

Every page must have a consistent vertical rhythm. Sections should feel like they breathe. The user's eye should travel downward effortlessly.

> *Luxury is what you don't have to fight through.*

---

## VII. COMPONENT STANDARDS

### 7.1 — Buttons

```
Primary:     bg primary-500, white text, radius-md, shadow-subtle
             Hover: bg primary-600, shadow-soft (150ms)
             Active: scale(0.98), bg primary-700
             Focus: shadow-focus ring

Secondary:   bg white, border border-default, neutral-700 text
             Hover: bg neutral-050, border-strong
             Active: scale(0.98)

Ghost:       no bg, no border, primary-600 text
             Hover: bg primary-050

Danger:      bg danger-500, white text
             Hover: bg danger-600

Disabled:    opacity 0.45, cursor not-allowed, no hover effect
```

**Button rules:**
- Minimum height: 36px (compact), 40px (default), 44px (large)
- Icon + text buttons: 8px gap between icon and label
- Never use more than 2 primary buttons on a single view
- Icon-only buttons must have a tooltip or aria-label
- Loading state: subtle spinner replaces label, maintain button width

---

### 7.2 — Cards

```
Background:  --color-bg-base (#FFFFFF)
Border:      1px solid --color-border-subtle
Shadow:      --shadow-subtle
Radius:      --radius-md (6px)
Padding:     --space-5 (20px) or --space-6 (24px)

Hover:
  translateY(-2px)
  shadow: --shadow-soft
  transition: --transition-base
```

**Card rules:**
- Cards must have a clear hierarchy: title → meta → content → action
- No cards within cards (maximum 1 level of card nesting)
- Cards are not the only layout pattern — use structured lists for simple data
- Card grids: 2-column or 3-column max, never 4-column for content cards

---

### 7.3 — Tables

Tables are the primary data display mechanism for academic records.

```
Header row:   bg neutral-050, text neutral-500, size text-xs uppercase, tracking 0.06em, weight 600
Body row:     bg white, border-b border-subtle, height 48px min
Hover row:    bg neutral-050
Selected row: bg primary-050, border-l 2px solid primary-500
Striping:     Optional — only if data is dense (10+ columns)

Cell padding: 12px 16px
Alignment:    Text left, Numbers right, Status centered
```

**Table rules:**
- Sticky header on scroll if table exceeds viewport height
- Empty table state: centered message, no empty rows
- Loading state: skeleton rows (3 visible), not spinner over table
- Column headers are sortable by default — show indicator subtly
- Never truncate cells that contain grades or critical data — wrap instead

---

### 7.4 — Forms & Inputs

```
Input height:     40px
Border:           1px solid border-default
Radius:           radius-sm (4px)
Background:       bg-base (white)
Text:             neutral-800, text-base
Label:            above input, text-sm, weight 500, neutral-700
Placeholder:      neutral-400
Helper text:      text-xs, neutral-500, below input

Focus state:
  border-color: primary-500
  shadow: shadow-focus
  outline: none

Error state:
  border-color: danger-500
  helper text: danger-600
  no shaking animation

Disabled state:
  bg: neutral-050
  border: border-subtle
  opacity: 0.7
  cursor: not-allowed
```

**Form layout rules:**
- Label always above input, never inside (placeholder is not a label)
- Group related fields visually with consistent spacing
- One column layout preferred for critical forms (enrollment, grades)
- Two column layout only for non-sequential data (address fields, date + time)
- Required indicators: subtle asterisk in neutral-500, with legend at top of form
- Inline validation: only after blur, not on every keystroke

---

### 7.5 — Badges & Status Tags

```
Padding:    3px 8px
Radius:     radius-full (pill)
Font size:  text-xs (11px)
Weight:     600
```

```
Status: Active      → success-100 bg, success-600 text
Status: Pending     → amber-100 bg, amber-600 text
Status: Inactive    → neutral-100 bg, neutral-500 text
Status: Alert       → danger-100 bg, danger-600 text
Grade: Excellent    → success-100 bg, success-600 text
Grade: Needs Effort → amber-100 bg, amber-600 text
Grade: Failing      → danger-100 bg, danger-600 text
```

**Badge rules:**
- Maximum 1 badge per card/row unless status dashboard
- Never decorate with icons inside badge unless critical (⚠ warning only)
- Do not stack badges vertically

---

### 7.6 — Data Metrics / KPI Blocks

Used in admin dashboards and parent summaries.

```
Container:   card style, padding 24px
Label:       text-xs, uppercase, tracking wide, neutral-500
Value:       text-3xl or text-2xl, weight 700, neutral-900
Sub-value:   text-sm, neutral-500 (e.g. "vs last term")
Trend icon:  ↑ success-600 / ↓ danger-600, only when meaningful
```

**Metric rules:**
- Maximum 4 metrics in a row
- Trend indicators are directional only — no percentage animations
- Never auto-refresh metrics without user action (disrupts concentration)

---

## VIII. MICRO-INTERACTION PHILOSOPHY

Micro-interactions are the final refinement layer. They are never the feature.

### Core Timing

```
Hover transitions:   150ms ease-out
State changes:       180ms ease-out
Page transitions:    250ms ease-out
Modal entrance:      200ms cubic-bezier(0.16, 1, 0.3, 1)
Modal exit:          150ms ease-in
Toast entrance:      200ms ease-out
Toast exit:          150ms ease-in
```

### Hover Behaviors

**Cards**
```
transform: translateY(-2px)
box-shadow: --shadow-soft
transition: all 150ms ease-out
```
No color explosion. No border color change on hover.

**Buttons (Primary)**
```
background-color: darken 8%
transition: background-color 150ms ease-out
```
No glow. No lift. No scale on hover.

**Buttons (Press)**
```
transform: scale(0.98)
transition: transform 100ms ease-out
```

**Table Rows**
```
background-color: --color-neutral-050
transition: background-color 100ms ease-out
```

**Navigation Items**
```
color: --color-primary-800
background: --color-primary-050
transition: all 150ms ease-out
```

**Tab Indicators**
```
The active underline slides horizontally using CSS transform.
Not by showing/hiding. Not by rebuilding. It glides.
transition: transform 180ms ease-out
```

### Forbidden Animations

```
✗ Bounce (cubic-bezier with overshoot)
✗ Elastic keyframes
✗ Dramatic scale (> 1.05 or < 0.92)
✗ Parallax scrolling
✗ Neon glows or luminous effects
✗ Spinning decorative icons
✗ Auto-playing sliders or carousels
✗ Confetti or celebration effects
✗ Number counter animations on data
✗ Skeleton loaders that pulse neon
✗ Accordion that springs
```

### Permitted Animations

```
✓ Card lift on hover (translateY -2px)
✓ Smooth underline slide on tab navigation
✓ Fade in on modal open
✓ Fade out on modal close
✓ Skeleton shimmer (grey on grey, subtle)
✓ Toast slide-in from bottom
✓ Dropdown fade + slight translateY(4px → 0)
✓ Focus ring appearance
✓ Button press scale (0.98)
✓ Page content fade-in on route change
```

---

## IX. PAGE ARCHITECTURE

Every page follows the same structural doctrine.

### Standard Page Template

```
┌─────────────────────────────────────────────────┐
│  SIDEBAR NAVIGATION           MAIN CONTENT       │
│  ─────────────────            ──────────────     │
│                               [Page Header]      │
│                               Title              │
│                               Context line       │
│                               ─────────────      │
│                               [Primary Action]   │
│                               ─────────────      │
│                               [Main Content]     │
│                               Structured data,   │
│                               tables, or cards   │
│                               ─────────────      │
│                               [Supporting Info]  │
└─────────────────────────────────────────────────┘
```

### Page Header Rules

- Title: always the first visible element after sidebar
- Subtitle/context: one line maximum, neutral-500
- Primary action button: right-aligned to title row
- Breadcrumb: above title if deeper than 2 levels
- No hero images. No banner graphics. No decorative dividers.

### Section Separator

Sections are separated by **space**, not horizontal rules.
If a divider is absolutely needed: `1px solid --color-border-subtle` at 40% opacity.

### Content Density Guidelines

```
Administrative data:   Dense — tables preferred
Parent-facing:         Relaxed — cards preferred
Student dashboards:    Moderate — metrics + list
Reports:               Typographic — prose + structured data
```

---

## X. RTL & ARABIC STANDARDS

This section is critical. Hikmah School operates bilingually. RTL is not an afterthought.

### Core Rules

- All layouts must support `dir="rtl"` without breaking
- Padding, margin, and border assignments must use logical properties

```css
/* Use this → */
margin-inline-start: 16px;
padding-inline-end: 24px;
border-inline-start: 2px solid ...;

/* Not this → */
margin-left: 16px;
padding-right: 24px;
border-left: 2px solid ...;
```

### Arabic Typography

- Arabic font renders at **1.1× the Latin size** for visual balance
- Arabic body text: minimum 16px (equivalent to Latin 15px)
- Arabic headings: minimum 22px
- Line height for Arabic: minimum 1.8 (Arabic letters require more vertical space)
- Do not use Latin italic or oblique styles for Arabic text

### Directionality

```
Icons that are directional (arrows, chevrons) must flip in RTL.
Icons that are not directional (clock, bell, star) do not flip.
Sidebar: rendered on the right in RTL layouts
Breadcrumbs: reversed order display, same semantic order
```

### Mixed Content (Arabic + Latin)

- Use `dir="auto"` on user-generated content containers
- Numbers always display in LTR direction even within RTL context
- Currency: amount LTR, currency symbol position follows locale convention

---

## XI. ACCESSIBILITY STANDARDS

Hikmah School digital products target **WCAG 2.1 Level AA** compliance at minimum.

### Color Contrast Requirements

```
Body text on white:       Minimum 4.5:1 contrast ratio
Large text on white:      Minimum 3:1 contrast ratio
UI components/states:     Minimum 3:1 contrast ratio
Placeholder text:         Minimum 3:1 (not 4.5 — it is supplemental)
```

Verified ratios for our palette:
```
neutral-700 (#333333) on white:   12.6:1  ✓
neutral-500 (#777777) on white:   4.48:1  ✓ (body min)
primary-600 (#2159A0) on white:   6.2:1   ✓
danger-600  (#8B1A1A) on white:   8.5:1   ✓
```

### Focus Management

- All interactive elements must have visible focus state
- Focus ring: `box-shadow: var(--shadow-focus)` — 3px ring, primary-500 at 20% opacity
- Never use `outline: none` without providing a custom focus style
- Modal opens must trap focus within modal
- Modal closes must return focus to triggering element

### Keyboard Navigation

- All actions must be reachable by keyboard
- Tab order must follow visual order
- Dropdowns: open with Enter/Space, navigate with Arrow keys, close with Escape
- Tables: navigable by arrow keys in data-heavy views

### Screen Reader

- All images have descriptive `alt` attributes
- Icon buttons have `aria-label`
- Form fields have associated `<label>` elements (not placeholder only)
- Status updates use `aria-live` regions
- Tables have `<caption>` and proper `scope` attributes on headers
- Modal uses `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

---

## XII. EMPTY, ERROR & LOADING STATES

These states are where cheap design gets exposed. We treat them with full design attention.

### Empty States

**Structure:**
```
Centered container
  Icon (subtle, monochrome, 40px)
  Title (neutral-700, text-md, weight 500)
  Description (neutral-500, text-sm, max-width 280px, centered)
  [Optional: Primary action button]
```

**Arabic example:**
```
(icon)
لا توجد بيانات متاحة حالياً
لم يتم إضافة أي سجلات بعد.
يمكنك البدء بإضافة سجل جديد.
[ + إضافة سجل ]
```

**Rules:**
- No playful illustrations
- No sad/crying emoji icons
- No overcrowded empty states with too much instruction
- Action button is optional — include only if the user can resolve the emptiness

---

### Error States

**Inline field error:**
```
Border: danger-500
Helper text: danger-600, text-xs, weight 400
Icon: ⚠ 12px, same color (optional)
No shaking. No flashing.
```

**Page-level error:**
```
Centered card
Icon: muted warning symbol
Title: clear explanation
Description: what happened and what to do
Action: Retry or Contact Support
```

**404 / Not Found:**
```
Large muted text: "404"
Line: "هذه الصفحة غير موجودة" / "Page not found"
Description: brief, neutral
Action: Return to Dashboard
No illustrations, no humor
```

---

### Loading States

**Data loading (tables, lists):**
```
Skeleton rows — 3 visible
Shimmer: subtle linear gradient animation, grey on grey
Duration: 1.5s loop
Color: neutral-100 base, neutral-200 shimmer
```

**Button loading:**
```
Text replaced by subtle spinner (16px, white)
Button maintains its width — no layout shift
Disabled during loading
```

**Page loading:**
```
Top progress bar (primary-500, 2px height) — not spinner overlay
Fade in page content when ready
```

**Never:**
- Full-screen overlay spinners for routine data loads
- Animated logo during loading
- "Loading..." text alone without visual indicator for >500ms waits

---

## XIII. MODAL & OVERLAY RULES

### Modal Anatomy

```
Overlay:     rgba(0,0,0,0.40), blur(2px) optional
Modal box:   bg-base, shadow-modal, radius-lg
Padding:     32px all sides
Max-width:   560px (default) / 720px (form modal) / 440px (confirm)
Animation:   fade in + subtle translateY(8px → 0) in 200ms
```

### Modal Structure

```
[HEADER]
  Title         → text-xl, weight 600, neutral-900
  Close button  → top-right, icon-only, ghost style

[CONTENT]
  Generous spacing
  Form fields or information
  Max height with internal scroll if needed

[FOOTER]
  Right-aligned buttons (RTL: left-aligned)
  Cancel → secondary style
  Confirm → primary style (or danger if destructive)
  Gap: 12px between buttons
```

### Confirmation Modal (Destructive Action)

```
Icon: subtle warning indicator (amber or danger, 24px)
Title: specific and clear ("حذف هذا الطالب؟")
Description: consequences explained briefly
Cancel: primary button (prevent accidental confirms)
Confirm: danger style, labeled precisely ("نعم، احذف")
```

### Rules

- Modals never open modals
- No more than one modal visible at a time
- Escape key always closes the modal
- Click on overlay closes the modal (unless unsaved data — then confirm discard)
- No maximize/minimize functionality
- No tab bar inside modals

---

## XIV. NAVIGATION ARCHITECTURE

### Sidebar

```
Width:          240px expanded / 64px collapsed
Background:     white or neutral-050
Border:         1px solid border-subtle (right side / left in RTL)
Transition:     200ms ease-out on expand/collapse

Navigation item:
  Height:       44px
  Padding:      0 16px
  Icon:         20px, neutral-400 (inactive) / primary-600 (active)
  Label:        text-sm, weight 500, neutral-600 (inactive) / neutral-900 (active)

Active indicator:
  Left border: 3px solid primary-600
  Background: primary-050
  No pill. No badge. No highlight box.
```

### Tab Navigation

```
Tab item:
  Padding: 10px 16px
  Font: text-sm, weight 500
  Color: neutral-500 (inactive) / neutral-900 (active)
  Border-bottom: 2px solid transparent (inactive) / primary-500 (active)
  
Underline transition:
  The indicator is a single element that slides under tabs
  using CSS transform, not individual borders appearing/disappearing.
  transition: transform 180ms ease-out, width 180ms ease-out
```

### Breadcrumb

```
Items separated by / or › (not arrows, not chevron icons)
Font: text-sm, neutral-400
Active/current page: neutral-700, weight 500
Max depth shown: 4 levels (collapse middle levels if deeper)
```

### Topbar (if used)

```
Height:       56px
Background:   white
Border-bottom: 1px solid border-subtle
Contains:     search, notifications, user avatar
No gradient. No colored topbar. No heavy branding in topbar.
```

---

## XV. FORBIDDEN PATTERNS

This section is the veto list. Any design containing these patterns must be revised.

### Visual Forbidden

```
✗ Gradient backgrounds on full pages or cards
✗ Colorful sidebar backgrounds
✗ Icon overload (more than 1 icon per sentence or label)
✗ Shadow stacking (multiple box-shadows building on each other)
✗ Rounded corners above 12px on content blocks
✗ Border-radius on table cells
✗ Stripe or pattern backgrounds
✗ Background images on functional pages
✗ Animated background gradients
✗ Glassmorphism (frosted glass effect)
✗ Neumorphism (light/dark shadow relief)
✗ Dark mode unless explicitly requested as separate theme
```

### Interaction Forbidden

```
✗ Hover tooltips that take >300ms to appear
✗ Click effects that delay more than 50ms
✗ Page transitions that block content for >300ms
✗ Scroll hijacking
✗ Auto-scrolling without user trigger
✗ Infinite scroll on academic data (pagination required)
✗ Drag-and-drop without keyboard alternative
✗ Mouse-over pop-up menus that close on slight mouse movement
```

### Content Forbidden

```
✗ Motivational quotes on dashboard
✗ Progress bars framed as "achievements"
✗ Points or XP systems in academic context
✗ Gamification badges (streak, level, etc.)
✗ Emojis in system UI or data
✗ Exclamation marks in system messages
✗ First-name-only references in formal academic records
✗ Abbreviations in table headers without tooltip
```

### Layout Forbidden

```
✗ Cards used where a structured list would suffice
✗ More than 3 columns of cards on standard pages
✗ Analytics charts as the first visible element on any page
✗ Horizontal scrolling on desktop
✗ Pop-overs that cover primary content
✗ Floating action buttons (FAB) — use contextual actions instead
✗ Sticky floating elements other than sidebar and topbar
```

---

## XVI. AI PROMPT LIBRARY

Use these prompts to enforce Hikmah School Digital Signature when working with AI tools. Copy, paste, and adapt.

### Standard Prefix (Include in Every Prompt)

```
Follow Hikmah School Digital Signature v2.0.
Apply the White Authority Principle, Soft Frame Rule, and Micro-Interaction Philosophy.
Avoid SaaS aesthetics, startup design patterns, and consumer app styles.
Maintain institutional luxury tone throughout.
Design must feel like a premium university portal — calm, authoritative, structured.
```

---

### Prompt: New Component

```
[STANDARD PREFIX]

Design a [COMPONENT NAME] component for Hikmah School's academic management portal.

Requirements:
- Background: white (#FFFFFF), border: 1px solid #E2E2E2, radius: 6px
- Typography: DM Sans for labels, neutral-900 for primary text, neutral-500 for secondary
- Hover: translateY(-2px) with shadow increase, 150ms ease-out, no color effects
- Colors: Only primary blue (#2968B8), success green (#217A44), danger red (#C0392B), and neutral greys
- RTL compatible using CSS logical properties
- WCAG 2.1 AA compliant

Do NOT include: gradients, glows, neon accents, heavy shadows, emojis, or SaaS patterns.
```

---

### Prompt: New Page

```
[STANDARD PREFIX]

Design the [PAGE NAME] page for Hikmah School's [user type] portal.

Page structure must be:
1. Page title (text-3xl, weight 700, neutral-900)
2. Context subtitle (text-sm, neutral-500)
3. Primary action (top-right aligned button, primary style)
4. Main content (table or structured card list — not card grid chaos)
5. Supporting information

Spacing: 8px base grid. Sections separated by 40–48px vertical space.
Page background: white. Content surfaces: white with soft border.
Navigation: left sidebar, 240px, white background.
No colored dashboard. No analytics charts as hero content.
```

---

### Prompt: Form Design

```
[STANDARD PREFIX]

Design the [FORM NAME] form for Hikmah School.

Form rules:
- Labels above inputs, text-sm, weight 500, neutral-700
- Input height: 40px, radius: 4px, border: 1px solid #E2E2E2
- Focus: primary-500 border + 3px focus ring at 20% opacity
- Error: danger-500 border, error text below in danger-600
- Submit button: primary style, right-aligned (or left in RTL)
- No inline validation on keypress — only on blur or submit

Layout: single column for critical data, two column max for address/contact fields.
No floating labels. No placeholder-only labels. No asterisk without legend.
```

---

### Prompt: Empty State

```
[STANDARD PREFIX]

Design an empty state for [CONTEXT/SECTION NAME].
Language: Arabic (RTL) primary, with English secondary.

Requirements:
- Centered layout with ample white space
- Subtle monochrome icon (40px)
- Title: neutral-700, text-md, weight 500 — clear and specific to context
- Description: neutral-500, text-sm, max 280px width, centered
- Optional CTA button if the user can resolve the emptiness

Do NOT use: colorful illustrations, sad icons, playful copy, emoji, or excessive text.
```

---

### Prompt: Animation/Interaction Audit

```
[STANDARD PREFIX]

Review the following [COMPONENT/PAGE] and audit all animations and interactions.

Enforce:
- Hover transitions: 150ms ease-out maximum
- No bounce, elastic, or spring animations
- No scale effects above 1.02 or below 0.96
- No color explosions on hover
- No glow effects
- Card hover: translateY(-2px) + shadow increase only
- Button press: scale(0.98) only
- Tab navigation: sliding underline, not border-toggle
- Modal: fade + translateY(8px → 0) on open, fade on close

Flag and rewrite any violation of the above rules.
```

---

## XVII. CLIENT HANDOFF CHECKLIST

Before delivering any design or implementation to the client, verify the following.

### Visual Quality

- [ ] All colors reference design tokens — no hardcoded hex values in components
- [ ] Typography scale followed precisely — no arbitrary font sizes
- [ ] Spacing follows 8px base grid — no arbitrary margins or paddings
- [ ] White Authority Principle applied — white is dominant on all pages
- [ ] Soft Frame Rule applied — all cards have correct border + shadow
- [ ] No forbidden animations present
- [ ] No forbidden visual patterns present (gradients, glows, etc.)
- [ ] Color used only for semantic meaning — not decoration

### Technical Quality

- [ ] CSS logical properties used throughout (not directional properties)
- [ ] RTL layout verified at all breakpoints
- [ ] Arabic font stack correctly applied to Arabic content
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG 2.1 AA on all text
- [ ] All icon buttons have aria-label or tooltip
- [ ] Form labels properly associated with inputs
- [ ] Empty states designed for all data-dependent views
- [ ] Loading states designed for all async content
- [ ] Error states designed for all form fields and pages

### Interaction Quality

- [ ] All hover effects at 150ms ease-out
- [ ] Card hover: lift + shadow only
- [ ] Button press: scale(0.98) only
- [ ] Tab underline slides smoothly
- [ ] Modal fades in, does not snap
- [ ] No interaction delay above 50ms
- [ ] Keyboard navigation complete
- [ ] Escape closes all modals and dropdowns

### Content & Tone

- [ ] No emojis in system UI
- [ ] No exclamation marks in system messages
- [ ] No gamification patterns
- [ ] Formal tone maintained in all labels and messages
- [ ] Arabic content uses correct academic vocabulary
- [ ] Empty states are informative but not playful
- [ ] Error messages are specific and helpful

---

## XVIII. CHANGELOG

| Version | Date | Summary |
|---|---|---|
| 1.0 | Initial | Brand personality, visual principles, color, typography, spacing, micro-interactions, page architecture, empty states, modals, navigation, AI prompts |
| 2.0 | Current | Added full design token system, expanded component library (buttons, cards, tables, forms, badges, KPIs), RTL/Arabic standards, accessibility (WCAG 2.1 AA), expanded forbidden patterns, complete AI prompt library, client handoff checklist, typography rationale, subject color identity, semantic color mapping |

---

## APPENDIX — QUICK REFERENCE CARD

```
╔══════════════════════════════════════════════════════════╗
║         HIKMAH SCHOOL — DESIGNER QUICK REFERENCE         ║
╠══════════════════════════════════════════════════════════╣
║  BACKGROUNDS      white · #FAFAFA · #F5F5F3             ║
║  BORDERS          1px solid #E2E2E2                      ║
║  SHADOWS          0 1px 3px rgba(0,0,0,0.06)            ║
║  RADIUS           4px · 6px · 8px                       ║
║  PRIMARY BLUE     #2968B8                                ║
║  SUCCESS GREEN    #217A44                                ║
║  DANGER RED       #C0392B                                ║
║  BODY TEXT        #333333  weight 400                    ║
║  HEADING TEXT     #111111  weight 600–700                ║
║  SECONDARY TEXT   #777777  weight 400                    ║
║  FONT (UI)        DM Sans                                ║
║  FONT (DISPLAY)   Playfair Display                       ║
║  FONT (ARABIC)    Noto Naskh Arabic                      ║
║  BASE GRID        8px                                    ║
║  CARD PADDING     20–24px                                ║
║  SECTION GAP      40–48px                                ║
║  TRANSITION       150–180ms ease-out                     ║
║  HOVER CARD       translateY(-2px) + shadow-soft         ║
║  BUTTON PRESS     scale(0.98)                            ║
╚══════════════════════════════════════════════════════════╝
```

---

*Hikmah School Digital Signature v2.0 — Confidential — Internal Use Only*
*This document governs all digital products developed for or by Hikmah School.*
*All parties implementing this system must adhere to its standards without exception.*