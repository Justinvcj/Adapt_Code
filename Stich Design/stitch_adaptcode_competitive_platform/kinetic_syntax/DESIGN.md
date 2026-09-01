---
name: Kinetic Syntax
colors:
  surface: '#111125'
  surface-dim: '#111125'
  surface-bright: '#37374d'
  surface-container-lowest: '#0c0c1f'
  surface-container-low: '#1a1a2e'
  surface-container: '#1e1e32'
  surface-container-high: '#28283d'
  surface-container-highest: '#333348'
  on-surface: '#e2e0fc'
  on-surface-variant: '#d9c3ad'
  inverse-surface: '#e2e0fc'
  inverse-on-surface: '#2f2e43'
  outline: '#a18d7a'
  outline-variant: '#544434'
  surface-tint: '#ffb867'
  primary: '#ffc78b'
  on-primary: '#482900'
  primary-container: '#ffa116'
  on-primary-container: '#683e00'
  inverse-primary: '#875200'
  secondary: '#aec6ff'
  on-secondary: '#002e6b'
  secondary-container: '#024ead'
  on-secondary-container: '#aec6ff'
  tertiary: '#94dbff'
  on-tertiary: '#003547'
  tertiary-container: '#02c4ff'
  on-tertiary-container: '#004d67'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddba'
  primary-fixed-dim: '#ffb867'
  on-primary-fixed: '#2b1700'
  on-primary-fixed-variant: '#673d00'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#aec6ff'
  on-secondary-fixed: '#001a43'
  on-secondary-fixed-variant: '#004397'
  tertiary-fixed: '#c0e8ff'
  tertiary-fixed-dim: '#71d2ff'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d66'
  background: '#111125'
  on-background: '#e2e0fc'
  surface-variant: '#333348'
  surface-elevated: '#282A36'
  surface-secondary: '#303240'
  easy: '#00B8A3'
  medium: '#FFC01E'
  hard: '#FF375F'
  success: '#2CBB5D'
  text-primary: '#EFF1F6'
  border-default: rgba(255, 255, 255, 0.08)
  border-hover: rgba(255, 255, 255, 0.16)
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
This design system is engineered for a high-performance competitive coding environment. The brand personality is technical, precise, and authoritative, designed to fade into the background so the user's focus remains entirely on logic and problem-solving. 

The aesthetic follows a **Modern Corporate/Developer** style with a focus on:
- **High-Density Information:** Optimized for complex data visualization and multi-pane code editors.
- **Precision Engineering:** Sharp borders and consistent 8px increments to reflect the rigors of algorithmic thinking.
- **Visual Hierarchy:** Distinct color coding for difficulty levels to provide immediate cognitive orientation.
- **Zero Distraction:** No aggressive marketing elements; every visual component serves a functional purpose.

## Colors
The palette utilizes a deep indigo-black base to reduce eye strain during long coding sessions. 

- **Functional Accents:** Difficulty levels (Easy, Medium, Hard) use high-saturation hues for instant recognition.
- **Success State:** A distinct green is reserved specifically for solved challenges and passed test cases.
- **Typography Contrast:** 
    - **Primary:** #EFF1F6 for maximum readability.
    - **Secondary:** 70% opacity for labels and meta-data.
    - **Tertiary:** 40% opacity for disabled states or subtle hints.
- **Borders:** Subtle white alphas create structural definition without the weight of solid colors, allowing for layered surfaces.

## Typography
The typography system prioritizes legibility and character distinction. 

- **UI Sans:** Inter is used for all navigational and descriptive elements. It provides excellent readability at small sizes common in data-heavy dashboards.
- **Monospace:** JetBrains Mono (serving as the available alternative for developer-centricity) is used for all code blocks, editor panels, and terminal outputs to ensure clear character differentiation (e.g., 0 vs O, l vs 1).
- **Mobile Scaling:** For mobile viewports, `headline-lg` should scale to 24px to maintain screen real estate for the code editor and problem descriptions.

## Layout & Spacing
The layout follows a **Fluid Grid** approach within constrained containers to maintain readability on ultra-wide monitors.

- **Grid:** A 12-column grid is used for the dashboard and problem-solving pages.
- **Split Panes:** Problem descriptions and code editors should utilize a resizable split-pane layout, allowing users to prioritize the workspace they need.
- **Rhythm:** All margins and paddings are derived from the 8px base unit. Small components (chips, small buttons) use 4px (0.5 units) for tighter grouping.
- **Breakpoints:**
    - **Mobile (< 768px):** Single column. Code editor takes priority with a collapsible description tab.
    - **Desktop (> 1024px):** Side-by-side view with a maximum content width of 1440px for the central dashboard.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Subtle Backdrop Blurs** rather than traditional heavy shadows.

- **Level 0 (Base):** #1A1A2E. Used for the main application background.
- **Level 1 (Cards):** #282A36. Used for secondary content blocks and problem list items. Includes a `1px` border of `rgba(255,255,255,0.08)`.
- **Level 2 (Overlays):** #303240. Used for modals, dropdowns, and active editor panels. 
- **Backdrop Blur:** Modals and navigation bars use a `12px` backdrop blur with a semi-transparent surface to maintain a sense of context within the application workspace.
- **Hover States:** Elevations do not "lift" with shadows; instead, the border opacity increases to `0.16` to signal interactivity.

## Shapes
The shape language is controlled and systematic, favoring "Soft" corners that feel modern but remain professional.

- **Default (4px):** Buttons, input fields, and small code snippets.
- **Medium (8px):** Cards, content containers, and sidebars.
- **Large (12px):** Modals and large dashboard sections.
- **Pill (9999px):** Difficulty tags, status chips, and specialized toggle switches.

## Components
- **Buttons:** Primary buttons use the Brand color (#FFA116) with black text for high contrast. Secondary buttons use a ghost style with the default border.
- **Chips:** Difficulty chips use pill-shaped containers with a 10% opacity background of their respective difficulty color and 100% opacity text for the label.
- **Code Editor:** The editor surface should use the Level 1 surface color. Active lines should be highlighted with a subtle `rgba(255,255,255,0.04)` background.
- **Input Fields:** Use #282A36 background with a 1px border. Focus state changes the border to the Link color (#5B8DEF) with a 2px outer glow of the same color at 20% opacity.
- **Lists:** Problem lists use Level 1 cards with horizontal separators. Hovering a list item should change the background to Level 2.
- **Progress Bars:** Use Success (#2CBB5D) for completion. Background tracks should be the secondary surface color.