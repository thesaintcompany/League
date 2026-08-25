# Design System Specification: Kinetic Precision

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Aerodynamic Editorial."** 

Moving away from the static, boxy constraints of traditional SaaS dashboards, this system focuses on the feeling of high-velocity movement captured in a clean, high-end print magazine. We achieve this through "Kinetic Air"—using expansive whitespace (the "Air") to drive the user's eye toward high-contrast, neon-accented focal points (the "Kinetic"). 

By utilizing intentional asymmetry, overlapping typography, and a "borderless" philosophy, we create a UI that feels like it’s in motion. The goal is a professional, elite experience that prioritizes clarity and sophisticated depth over standard container-based layouts.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a clinical, "Light Slate" foundation, punctuated by the high-energy vibration of neon green.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Structure must be defined through **Tonal Transitions**. To separate a sidebar from a main feed, transition from `surface` (#f5f7f9) to `surface-container-low` (#eef1f3). This creates a seamless, high-end feel that mimics architectural planes rather than digital boxes.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers. 
*   **Base Layer:** `surface` (#f5f7f9)
*   **Secondary Content:** `surface-container-low` (#eef1f3)
*   **Floating Elements/Cards:** `surface-container-lowest` (#ffffff)
*   **Deep Interaction:** `surface-container-high` (#dfe3e6)

### The "Glass & Gradient" Rule
To elevate the primary neon green (#ADFF2F), do not use it only as a flat fill. Use the **Signature Texture**: A linear gradient from `primary` (#406600) to `primary_container` (#a2f31f) at a 135-degree angle for hero CTAs. For floating navigation, apply `surface_container_lowest` with a 70% opacity and a `20px` backdrop-blur to create a "Frosted Precision" effect.

---

## 3. Typography
The system utilizes **Plus Jakarta Sans** for its geometric clarity and modern terminal cuts, which mirror the "Round Four" corner radius.

*   **Display (lg/md/sm):** Used for "Hero Moments." Use `display-lg` (3.5rem) with `-0.04em` letter spacing to create an authoritative, editorial impact.
*   **Headlines:** Always in `on_surface` (#2c2f31). These should be placed with generous top-padding (`spacing-16`) to let the "Aerodynamic" feel take hold.
*   **Body:** `body-lg` (1rem) is the workhorse. Ensure a line-height of 1.6 to maintain the "Kinetic Air" philosophy.
*   **Labels:** `label-md` should be used sparingly for metadata, often in all-caps with `0.05em` tracking to provide a technical, "instrument cluster" aesthetic.

---

## 4. Elevation & Depth
We eschew traditional drop shadows for **Tonal Layering** and **Ambient Glows**.

*   **The Layering Principle:** A "Card" is defined by placing a `surface-container-lowest` (#ffffff) object onto a `surface` (#f5f7f9) background. The `1rem` (Round Four) corner radius provides the only visual break needed.
*   **Ambient Shadows:** If a shadow is required for a modal, use a "Tinted Diffusion": `box-shadow: 0 20px 40px rgba(44, 47, 49, 0.06)`. Notice the shadow is a low-opacity version of the `on_surface` color, never pure black.
*   **The "Ghost Border" Fallback:** If a layout feels too "bleached" for accessibility, use the `outline_variant` (#abadaf) at **15% opacity**. This provides a hint of a boundary without interrupting the visual flow.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary_container` text, `xl` (3rem) roundness. High-contrast, high-energy.
*   **Secondary:** `surface_container_high` fill with no border. Used for "low-velocity" actions.
*   **Tertiary:** Ghost style. No background, `primary` text, with a subtle `2px` underline that appears only on hover.

### Input Fields
*   **Style:** No borders. A `surface_container_low` fill with a `4px` thick "Indicator Bar" on the left using the `primary` neon color when focused.
*   **Corner:** `sm` (0.5rem) for a tighter, more functional look compared to buttons.

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Execution:** Use `spacing-6` (1.5rem) of vertical whitespace to separate list items. For cards, use a slight background shift (e.g., a `surface_container_lowest` card on a `surface` background).

### Kinetic Progress Indicators
Use the `primary` neon green for progress bars, but layer it over a `surface_container_highest` track. Add a subtle "glow" using a `4px` blur of the `primary` color to simulate a powered light-pipe.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use white space as a structural element. If a section feels crowded, double the padding instead of adding a line.
*   **DO** lean into the "Round Four" (`1rem`) default for most containers to maintain a friendly but professional "Kinetic" feel.
*   **DO** use `display` type scales for numbers and data visualizations to make them feel like "Hero" stats.

### Don't:
*   **DON'T** use 100% black (#000000). Always use `on_surface` (#2c2f31) for text to keep the "Light Slate" professional tone.
*   **DON'T** use the Primary Neon Green for body text. It is an accent/action color; using it for long-form reading will break accessibility.
*   **DON'T** use "Standard" card shadows. Stick to Tonal Layering or the specified "Ambient Glow."
*   **DON'T** use "Round Four" on tiny elements like checkboxes; use `sm` (0.5rem) to prevent them from looking like circles.